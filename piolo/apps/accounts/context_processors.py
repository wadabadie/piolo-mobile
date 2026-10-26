from django.utils import timezone
from apps.properties.models import Favorite, VisitRequest, SearchAlert
from apps.messaging.models import Message
from django.db.models import Q

def locataire_sidebar(request):
    """Injects sidebar metrics for the tenant dashboard."""
    if not request.user.is_authenticated:
        return {}

    user = request.user
    
    # Calculate global unread messages for ANY authenticated user (tenant or landlord)
    unread_messages = Message.objects.filter(
        Q(conversation__tenant=user) | Q(conversation__landlord=user),
        is_read=False
    ).exclude(sender=user).count()
    
    context = {'unread_messages': unread_messages}

    # If user is locataire, add specific metrics
    if getattr(user, 'is_locataire', False):
        saved_count = Favorite.objects.filter(user=user).count()
        upcoming_visits = VisitRequest.objects.filter(
            tenant=user,
            status='CONFIRMED',
            confirmed_date__gte=timezone.now().date()
        )
        search_alerts = SearchAlert.objects.filter(user=user, is_active=True)
        
        context.update({
            'saved_count': saved_count,
            'upcoming_visits': upcoming_visits,
            'search_alerts': search_alerts,
        })

    return context
