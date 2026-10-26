from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Conversation, Message
from apps.properties.models import Property
from django.db.models import Q, Count

@login_required
def start_conversation(request, property_id):
    """
    Called when a tenant clicks 'Contacter bailleur' on a property.
    Creates or fetches a conversation between the tenant and the landlord.
    """
    property_obj = get_object_or_404(Property, id=property_id)
    landlord = property_obj.owner
    tenant = request.user
    
    if landlord == tenant:
        return redirect('accounts:auth') # Should redirect to dashboard, but auth is safer
        
    conversation, created = Conversation.objects.get_or_create(
        tenant=tenant,
        landlord=landlord,
        property=property_obj
    )
    
    return redirect('messaging:chat_room', conversation_id=conversation.id)

@login_required
def chat_room(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    if request.user != conversation.tenant and request.user != conversation.landlord:
        return redirect('accounts:auth')
        
    Message.objects.filter(
        conversation=conversation, 
        is_read=False
    ).exclude(sender=request.user).update(is_read=True)
    
    messages = conversation.messages.all().order_by('created_at')
    other_user = conversation.landlord if request.user == conversation.tenant else conversation.tenant
    
    conversations_qs = Conversation.objects.filter(
        Q(tenant=request.user) | Q(landlord=request.user)
    ).annotate(
        unread_count=Count('messages', filter=Q(messages__is_read=False) & ~Q(messages__sender=request.user))
    ).order_by('-updated_at')
    
    conversations = list(conversations_qs)
    for conv in conversations:
        conv.other_user = conv.landlord if request.user == conv.tenant else conv.tenant
    
    context = {
        'conversation': conversation,
        'messages': messages,
        'other_user': other_user,
        'property': conversation.property,
        'conversations': conversations,
    }
    return render(request, 'messaging/chat.html', context)

@login_required
def api_send_message(request, conversation_id):
    if request.method == 'POST':
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user != conversation.tenant and request.user != conversation.landlord:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
            
        content = request.POST.get('content', '').strip()
        file = request.FILES.get('file')
        voice = request.FILES.get('voice')
        reply_to_id = request.POST.get('reply_to_id')
        
        reply_to_msg = None
        if reply_to_id:
            try:
                reply_to_msg = Message.objects.get(id=reply_to_id, conversation=conversation)
            except Message.DoesNotExist:
                pass
        
        if content or file or voice:
            msg = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content,
                file=file,
                voice=voice,
                reply_to=reply_to_msg
            )
            # Update conversation updated_at
            conversation.save()

            recipient = conversation.landlord if request.user == conversation.tenant else conversation.tenant
            from apps.notifications.models import Notification
            from apps.notifications.services import create_notification
            from apps.notifications.email_service import send_message_email

            create_notification(
                recipient,
                Notification.Kind.MESSAGE,
                'Nouveau message',
                f'{request.user.get_full_name() or request.user.email} vous a envoyé un message.',
                actor=request.user,
                url=f'/messages/{conversation.id}',
                entity_type='conversation',
                entity_id=conversation.id,
                data={'message_id': msg.id, 'property_id': str(conversation.property_id) if conversation.property_id else None},
                priority=Notification.Priority.NORMAL,
                dedupe_key=f'message:{msg.id}',
            )
            send_message_email(msg, recipient)
            
            return JsonResponse({
                'id': msg.id,
                'content': msg.content,
                'sender_id': msg.sender.id,
                'created_at': msg.created_at.strftime('%H:%M'),
                'file_url': msg.file.url if msg.file else None,
                'file_name': msg.file.name.split('/')[-1] if msg.file else None,
                'voice_url': msg.voice.url if msg.voice else None,
                'reply_to_id': msg.reply_to.id if msg.reply_to else None,
                'reply_to_content': msg.reply_to.content if msg.reply_to else None,
            })
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def api_fetch_messages(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id)
    if request.user != conversation.tenant and request.user != conversation.landlord:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
        
    last_id = request.GET.get('last_id', 0)
    try:
        last_id = int(last_id)
    except ValueError:
        last_id = 0
        
    new_messages = conversation.messages.filter(id__gt=last_id).order_by('created_at')
    
    # Mark as read
    new_messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
    
    data = []
    for msg in new_messages:
        data.append({
            'id': msg.id,
            'content': msg.content,
            'sender_id': msg.sender.id,
            'created_at': msg.created_at.strftime('%H:%M'),
            'file_url': msg.file.url if msg.file else None,
            'file_name': msg.file.name.split('/')[-1] if msg.file else None,
            'voice_url': msg.voice.url if msg.voice else None,
            'reply_to_id': msg.reply_to.id if msg.reply_to else None,
            'reply_to_content': msg.reply_to.content if msg.reply_to else None,
        })
        
    return JsonResponse({'messages': data})

@login_required
def conversations_list(request):
    conversations_qs = Conversation.objects.filter(
        Q(tenant=request.user) | Q(landlord=request.user)
    ).annotate(
        unread_count=Count('messages', filter=Q(messages__is_read=False) & ~Q(messages__sender=request.user))
    ).order_by('-updated_at')
    
    conversations = list(conversations_qs)
    for conv in conversations:
        conv.other_user = conv.landlord if request.user == conv.tenant else conv.tenant
        
    return render(request, 'messaging/chat.html', {'conversations': conversations})

@login_required
def api_delete_message(request, message_id):
    if request.method == 'POST':
        msg = get_object_or_404(Message, id=message_id)
        if msg.sender != request.user:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        
        # We can either hard delete or soft delete. Hard delete for now.
        msg.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)
