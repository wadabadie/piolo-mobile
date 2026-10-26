@login_required(login_url='accounts:auth')
def profile_complete_view(request):
    """Page pour compléter le profil et gagner 10 points."""
    user = request.user
    from apps.accounts.models import PointTransaction
    
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
    return render(request, 'accounts/profile_complete.html', context)


@require_GET
def dashboard_locataire(request):

---

