import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piolo.settings')
django.setup()

from apps.accounts.models import CustomUser, BailleurDossier, UserRole, AccountStatus, DossierStatus

# Landlord 1
b1, _ = CustomUser.objects.get_or_create(email="bailleur.bastos@piolo.cm", defaults={
    'first_name': 'Jean-Marc',
    'last_name': 'Mbida',
    'phone': '+237699001122',
    'role': UserRole.BAILLEUR,
    'status': AccountStatus.PENDING,
    'city': 'Yaoundé',
})
b1.set_password('Bailleur123!')
b1.role = UserRole.BAILLEUR
b1.status = AccountStatus.PENDING
b1.save()

d1, created1 = BailleurDossier.objects.get_or_create(user=b1, defaults={
    'document_type': 'CNI',
    'document_number': 'CNI-YDE-2026-9042',
    'city': 'Yaoundé',
    'neighborhoods': 'Bastos, Golf',
    'property_count': 3,
    'property_types': 'Appartements & Villas',
    'description': "Propriétaire d'une résidence de 3 appartements standing à Bastos.",
    'status': DossierStatus.PENDING,
})

# Landlord 2
b2, _ = CustomUser.objects.get_or_create(email="bailleur.bonapriso@piolo.cm", defaults={
    'first_name': 'Solange',
    'last_name': 'Eto\'o',
    'phone': '+237677334455',
    'role': UserRole.BAILLEUR,
    'status': AccountStatus.PENDING,
    'city': 'Douala',
})
b2.set_password('Bailleur123!')
b2.role = UserRole.BAILLEUR
b2.status = AccountStatus.PENDING
b2.save()

d2, created2 = BailleurDossier.objects.get_or_create(user=b2, defaults={
    'document_type': 'PASSEPORT',
    'document_number': 'PASSP-DLA-88310',
    'city': 'Douala',
    'neighborhoods': 'Bonapriso, Akwa',
    'property_count': 2,
    'property_types': 'Studios meublés & Bureaux',
    'description': "Gestionnaire de 2 duplex meublés pour séjours d'affaires.",
    'status': DossierStatus.PENDING,
})

print(f"Demo Landlord Dossiers Created! d1={d1.id}, d2={d2.id}")
