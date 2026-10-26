import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piolo.settings')
django.setup()

from apps.accounts.models import CustomUser, UserRole, AccountStatus

email = "admin@piolo.cm"
user, created = CustomUser.objects.get_or_create(email=email, defaults={
    'first_name': 'Super',
    'last_name': 'Admin',
    'role': UserRole.ADMIN,
    'status': AccountStatus.ACTIVE,
    'is_staff': True,
    'is_superuser': True,
    'is_active': True,
})

user.set_password('AdminPiolo2026!')
user.role = UserRole.ADMIN
user.is_staff = True
user.is_superuser = True
user.status = AccountStatus.ACTIVE
user.is_active = True
user.save()

print(f"Super-Admin account ready: {email} / AdminPiolo2026! (created={created})")
