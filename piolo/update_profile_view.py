import re

replacement = """@login_required(login_url='accounts:auth')
def profile_complete_view(request):
    \"\"\"Page pour compléter le profil (gère Locataires et Bailleurs).\"\"\"
    user = request.user
    from apps.accounts.models import PointTransaction, BailleurDossier, DossierStatus
    
    if user.is_bailleur:
        # ---- LOGIQUE BAILLEUR ----
        dossier, created = BailleurDossier.objects.get_or_create(user=user)
        
        # Calcul complétion
        user_fields = [user.first_name, user.last_name, user.phone, user.city, user.avatar]
        dossier_fields = [dossier.document_type, dossier.document_number, dossier.cni_recto, dossier.cni_verso, dossier.selfie, dossier.neighborhoods, dossier.property_types, dossier.description]
        all_fields = user_fields + dossier_fields
        profile_completion = int(sum(1 for f in all_fields if f) / len(all_fields) * 100) if all_fields else 0
        was_complete = profile_completion == 100

        if request.method == 'POST':
            # Mise à jour CustomUser
            user.first_name = request.POST.get('first_name', user.first_name)
            user.last_name = request.POST.get('last_name', user.last_name)
            user.phone = request.POST.get('phone', user.phone)
            user.city = request.POST.get('city', user.city)
            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']
            user.save()

            # Mise à jour BailleurDossier
            dossier.document_type = request.POST.get('document_type', dossier.document_type)
            dossier.document_number = request.POST.get('document_number', dossier.document_number)
            dossier.city = request.POST.get('city', dossier.city)
            dossier.neighborhoods = request.POST.get('neighborhoods', dossier.neighborhoods)
            
            try:
                dossier.property_count = int(request.POST.get('property_count', dossier.property_count))
            except ValueError:
                pass
            
            dossier.property_types = request.POST.get('property_types', dossier.property_types)
            dossier.description = request.POST.get('description', dossier.description)
            
            # Fichiers
            if 'cni_recto' in request.FILES: dossier.cni_recto = request.FILES['cni_recto']
            if 'cni_verso' in request.FILES: dossier.cni_verso = request.FILES['cni_verso']
            if 'selfie' in request.FILES: dossier.selfie = request.FILES['selfie']
            
            dossier.status = DossierStatus.PENDING
            dossier.save()

            messages.success(request, "Profil bailleur mis à jour. Votre dossier est en cours d'examen.")
            return redirect('accounts:bailleur_dashboard')
            
        context = {
            'profile_completion': profile_completion,
            'dossier': dossier,
        }
        return render(request, 'accounts/profile_complete_bailleur.html', context)
        
    else:
        # ---- LOGIQUE LOCATAIRE / STANDARD ----
        fields = [user.first_name, user.last_name, user.email,
                  getattr(user, 'phone', None), getattr(user, 'city', None),
                  getattr(user, 'avatar', None)]
        was_complete = int(sum(1 for f in fields if f) / len(fields) * 100) == 100

        if request.method == 'POST':
            user.first_name = request.POST.get('first_name', user.first_name)
            user.last_name = request.POST.get('last_name', user.last_name)
            user.phone = request.POST.get('phone', user.phone)
            user.city = request.POST.get('city', user.city)
            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']
            user.save()

            # Recalculer
            new_fields = [user.first_name, user.last_name, user.email,
                          getattr(user, 'phone', None), getattr(user, 'city', None),
                          getattr(user, 'avatar', None)]
            is_complete = int(sum(1 for f in new_fields if f) / len(new_fields) * 100) == 100

            if is_complete and not was_complete:
                if not PointTransaction.objects.filter(user=user, reason__icontains="Profil complété").exists():
                    user.award_points(10, "Profil complété à 100%")
                    messages.success(request, "Félicitations ! Votre profil est complet. Vous avez gagné 10 points fidélité.")
                else:
                    messages.success(request, "Profil mis à jour avec succès.")
            else:
                messages.success(request, "Profil mis à jour avec succès.")
            
            return redirect('accounts:dashboard_locataire')

        context = {
            'profile_completion': int(sum(1 for f in fields if f) / len(fields) * 100),
        }
        return render(request, 'accounts/profile_complete.html', context)"""

with open('apps/accounts/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the existing profile_complete_view
pattern = r"@login_required\(login_url='accounts:auth'\)\ndef profile_complete_view\(request\):.*?return render\(request, 'accounts/profile_complete\.html', context\)"

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('apps/accounts/views.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
