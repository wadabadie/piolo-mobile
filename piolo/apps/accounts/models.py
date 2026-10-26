# apps/accounts/models.py
"""
Modèles de l'app accounts pour Piolo Immobilier.

- CustomUser        : Utilisateur principal (auth par email)
- PointTransaction  : Journal des points fidélité
- BailleurDossier   : Dossier KYC soumis par les bailleurs candidats
"""

import uuid

from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db import models as db_models


# ── Choix d'énumérations ──────────────────────────────────────────────────────

class UserRole(models.TextChoices):
    LOCATAIRE  = 'LOCATAIRE',  'Locataire'
    BAILLEUR   = 'BAILLEUR',   'Bailleur'
    ARCHITECTE = 'ARCHITECTE', 'Architecte'
    ADMIN      = 'ADMIN',      'Administrateur'

class VerificationLevel(models.IntegerChoices):
    LEVEL_1 = 1, 'Non vérifié'
    LEVEL_2 = 2, 'Vérifié PIolo'
    LEVEL_3 = 3, 'Premium'



class AccountStatus(models.TextChoices):
    ACTIVE    = 'ACTIVE',    'Actif'
    PENDING   = 'PENDING',   'En attente de validation'
    SUSPENDED = 'SUSPENDED', 'Suspendu'
    BLOCKED   = 'BLOCKED',   'Bloqué définitivement'


class DossierStatus(models.TextChoices):
    PENDING   = 'PENDING',   'En attente'
    APPROVED  = 'APPROVED',  'Approuvé'
    REJECTED  = 'REJECTED',  'Rejeté'
    SUSPENDED = 'SUSPENDED', 'Suspendu'


# ── Manager personnalisé ──────────────────────────────────────────────────────

class CustomUserManager(BaseUserManager):
    """Manager pour CustomUser — authentification par email (sans username)."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('status', AccountStatus.ACTIVE)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('status', AccountStatus.ACTIVE)
        extra_fields.setdefault('is_active', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Un superutilisateur doit avoir is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Un superutilisateur doit avoir is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


# ── Modèle Utilisateur Principal ─────────────────────────────────────────────

class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Utilisateur Piolo.

    Points importants :
    - Authentification par EMAIL  (USERNAME_FIELD = 'email')
    - Pas de champ 'username'
    - Rôles : LOCATAIRE, BAILLEUR, ARCHITECTE, ADMIN
    - Statuts : ACTIVE, PENDING, SUSPENDED, BLOCKED
    - Système de points fidélité intégré
    """

    # Clé primaire UUID — meilleure sécurité que l'auto-incrément
    id = models.UUIDField(
        primary_key = True,
        default     = uuid.uuid4,
        editable    = False,
    )

    # ── Authentification ──────────────────────────────────────────────────
    email = models.EmailField(
        unique      = True,
        verbose_name = "Adresse email",
    )

    # ── Informations personnelles ─────────────────────────────────────────
    first_name = models.CharField(max_length=80,  verbose_name="Prénom")
    last_name  = models.CharField(max_length=80,  verbose_name="Nom")
    phone      = models.CharField(max_length=20,  blank=True, verbose_name="Téléphone")
    phone_verified = models.BooleanField(
        default      = False,
        verbose_name = "Téléphone vérifié",
    )
    avatar = models.ImageField(
        upload_to    = 'avatars/',
        null         = True,
        blank        = True,
        verbose_name = "Avatar",
    )
    city = models.CharField(max_length=60, blank=True, verbose_name="Ville")

    # ── Rôle et statut ────────────────────────────────────────────────────
    role = models.CharField(
        max_length   = 20,
        choices      = UserRole.choices,
        default      = UserRole.LOCATAIRE,
        verbose_name = "Rôle",
        db_index     = True,
    )
    status = models.CharField(
        max_length   = 20,
        choices      = AccountStatus.choices,
        default      = AccountStatus.ACTIVE,
        verbose_name = "Statut du compte",
        db_index     = True,
    )

    # ── Points fidélité ───────────────────────────────────────────────────
    points = models.PositiveIntegerField(default=0, verbose_name="Points fidélité")

    # ── Champs Django obligatoires ────────────────────────────────────────
    is_active   = models.BooleanField(default=True,  verbose_name="Compte actif")
    is_staff    = models.BooleanField(default=False, verbose_name="Accès admin")
    
    verification_level = models.PositiveSmallIntegerField(
        choices=VerificationLevel.choices,
        default=VerificationLevel.LEVEL_1,
        verbose_name="Niveau de vérification",
        db_index=True,
    )

    date_joined = models.DateTimeField(
        default      = timezone.now,
        verbose_name = "Date d'inscription",
    )

    # ── Configuration Django Auth ─────────────────────────────────────────
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']   # pour createsuperuser

    objects = CustomUserManager()

    class Meta:
        db_table         = 'piolo_users'
        verbose_name     = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering         = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]

    # ── Propriétés de rôle ────────────────────────────────────────────────

    @property
    def is_locataire(self) -> bool:
        return self.role == UserRole.LOCATAIRE

    @property
    def is_bailleur(self) -> bool:
        return self.role == UserRole.BAILLEUR

    @property
    def is_bailleur_active(self) -> bool:
        return self.role == UserRole.BAILLEUR and self.status == AccountStatus.ACTIVE

    @property
    def is_pending_bailleur(self) -> bool:
        return self.role == UserRole.BAILLEUR and self.status == AccountStatus.PENDING

    @property
    def is_architecte(self) -> bool:
        return self.role == UserRole.ARCHITECTE

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN or self.is_superuser

    @property
    def active_tenant_subscription(self):
        """Retourne l'abonnement VIP locataire actif s'il existe."""
        return self.tenant_subscriptions.filter(status='ACTIVE', expires_at__gt=timezone.now()).order_by('-expires_at').first()

    @property
    def is_vip_tenant(self) -> bool:
        return self.active_tenant_subscription is not None

    # ── Points fidélité ───────────────────────────────────────────────────

    def award_points(self, amount: int, reason: str = "") -> int:
        """
        Crédite des points fidélité à cet utilisateur.
        Enregistre la transaction dans PointTransaction.
        Retourne le nouveau solde.
        """
        if amount <= 0:
            raise ValueError(f"Le montant doit être positif (reçu : {amount}).")
        with transaction.atomic():
            locked = type(self).objects.select_for_update().get(pk=self.pk)
            locked.points += amount
            locked.save(update_fields=['points'])
            PointTransaction.objects.create(
                user=locked, delta=amount, reason=reason,
                balance_after=locked.points,
            )
            self.points = locked.points
        return self.points

    def deduct_points(self, amount: int, reason: str = "") -> int:
        """
        Débite des points fidélité.
        Lève ValueError si le solde est insuffisant.
        """
        if amount <= 0:
            raise ValueError(f"Le montant doit être positif (reçu : {amount}).")
        with transaction.atomic():
            locked = type(self).objects.select_for_update().get(pk=self.pk)
            if locked.points < amount:
                raise ValueError(
                    f"Solde insuffisant : {locked.points} pt(s) disponible(s), "
                    f"{amount} requis."
                )
            locked.points -= amount
            locked.save(update_fields=['points'])
            PointTransaction.objects.create(
                user=locked, delta=-amount, reason=reason,
                balance_after=locked.points,
            )
            self.points = locked.points
        return self.points


# ── Journal des transactions de points ───────────────────────────────────────

class PointTransaction(models.Model):
    """Enregistre chaque crédit ou débit de points fidélité."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        CustomUser,
        on_delete    = models.CASCADE,
        related_name = 'point_transactions',
        verbose_name = "Utilisateur",
    )
    delta         = models.IntegerField(verbose_name="Variation (+ ou -)")
    balance_after = models.PositiveIntegerField(verbose_name="Solde après opération")
    reason        = models.CharField(max_length=200, blank=True, verbose_name="Motif")
    created_at    = models.DateTimeField(auto_now_add=True, verbose_name="Date")

    class Meta:
        db_table         = 'piolo_point_transactions'
        verbose_name     = 'Transaction de points'
        verbose_name_plural = 'Transactions de points'
        ordering         = ['-created_at']

    def __str__(self):
        sign = '+' if self.delta > 0 else ''
        return f"{self.user.email}: {sign}{self.delta} pts ({self.reason})"


# ── Dossier KYC Bailleur ─────────────────────────────────────────────────────

class BailleurDossier(models.Model):
    """
    Dossier de vérification d'identité (KYC) soumis par un bailleur candidat.
    Doit être approuvé manuellement par un administrateur.

    Règle métier :
    - Après 3 rejets, le compte est bloqué définitivement.
    - Un seul dossier par utilisateur (OneToOne).
    - La re-soumission après rejet supprime l'ancien dossier.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        CustomUser,
        on_delete    = models.CASCADE,
        related_name = 'bailleur_dossier',
        verbose_name = "Utilisateur",
    )

    # ── Identité ─────────────────────────────────────────────────────────
    DOCUMENT_CHOICES = [
        ('CNI',       "Carte Nationale d'Identité"),
        ('PASSEPORT', "Passeport biométrique"),
        ('SEJOUR',    "Titre de séjour"),
    ]
    document_type   = models.CharField(
        max_length = 30,
        choices    = DOCUMENT_CHOICES,
        default    = 'CNI',
        verbose_name = "Type de document",
    )
    document_number = models.CharField(max_length=50, blank=True, verbose_name="Numéro du document")
    cni_recto       = models.FileField(upload_to='kyc/recto/',  blank=True, verbose_name="Recto de la pièce")
    cni_verso       = models.FileField(upload_to='kyc/verso/',  blank=True, verbose_name="Verso de la pièce")
    selfie          = models.FileField(upload_to='kyc/selfies/', blank=True, verbose_name="Selfie de vérification")

    # ── Patrimoine ────────────────────────────────────────────────────────
    city           = models.CharField(max_length=60,  blank=True, verbose_name="Ville principale")
    neighborhoods  = models.CharField(max_length=200, blank=True, verbose_name="Quartiers")
    property_count = models.PositiveSmallIntegerField(default=1, verbose_name="Nombre de biens")
    property_types = models.CharField(max_length=200, blank=True, verbose_name="Types de biens")
    description    = models.TextField(blank=True, verbose_name="Description du patrimoine")

    # ── Statut & Audit ────────────────────────────────────────────────────
    status = models.CharField(
        max_length   = 20,
        choices      = DossierStatus.choices,
        default      = DossierStatus.PENDING,
        verbose_name = "Statut du dossier",
        db_index     = True,
    )
    rejection_reason = models.TextField(blank=True, verbose_name="Motif de rejet")
    rejection_count  = models.PositiveSmallIntegerField(
        default      = 0,
        verbose_name = "Nombre de rejets",
    )

    reviewed_by = models.ForeignKey(
        CustomUser,
        null         = True,
        blank        = True,
        on_delete    = models.SET_NULL,
        related_name = 'reviewed_dossiers',
        verbose_name = "Examiné par",
    )
    reviewed_at  = models.DateTimeField(null=True, blank=True, verbose_name="Date de révision")
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de soumission")

    class Meta:
        db_table         = 'piolo_bailleur_dossiers'
        verbose_name     = 'Dossier Bailleur'
        verbose_name_plural = 'Dossiers Bailleurs'

    def __str__(self):
        return f"Dossier {self.user.get_full_name()} — {self.get_status_display()}"

    # ── Méthodes de traitement du dossier ─────────────────────────────────

    def approve(self, admin_user: CustomUser) -> None:
        """
        Approuve le dossier et active le compte bailleur.
        Crédite les points de bienvenue.
        """
        from django.conf import settings as django_settings

        self.status      = DossierStatus.APPROVED
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])

        self.user.status      = AccountStatus.ACTIVE
        self.user.is_active   = True
        self.user.verification_level = VerificationLevel.LEVEL_2
        self.user.save(update_fields=['status', 'is_active', 'verification_level'])

        bonus = getattr(django_settings, 'POINTS_CONFIG', {}).get('BAILLEUR_WELCOME', 10)
        self.user.award_points(bonus, "Points de bienvenue — Bailleur vérifié")

    def reject(self, admin_user: CustomUser, reason: str) -> None:
        """
        Rejette le dossier avec motif obligatoire.
        Bloque définitivement le compte après 3 rejets.
        """
        if not reason or not reason.strip():
            raise ValueError("Un motif de rejet est obligatoire.")

        from django.conf import settings as django_settings
        max_rejections = getattr(
            django_settings, 'BAILLEUR_CONFIG', {}
        ).get('MAX_REJECTIONS', 3)

        self.status           = DossierStatus.REJECTED
        self.rejection_reason = reason.strip()
        self.rejection_count  += 1
        self.reviewed_by      = admin_user
        self.reviewed_at      = timezone.now()
        self.save(update_fields=[
            'status', 'rejection_reason', 'rejection_count',
            'reviewed_by', 'reviewed_at',
        ])

        if self.rejection_count >= max_rejections:
            self.user.status = AccountStatus.BLOCKED
            self.user.save(update_fields=['status'])


# ── Journal d'Audit et Sécurité (Live Traffic & Logins) ───────────────────────

class AuditLog(models.Model):
    """Enregistre l'activité des utilisateurs, les tentatives de connexion et actions sensibles."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
        verbose_name="Utilisateur",
    )
    email = models.CharField(max_length=255, blank=True, verbose_name="Email soumis")
    action = models.CharField(max_length=100, db_index=True, verbose_name="Action")
    ip_address = models.CharField(max_length=45, blank=True, verbose_name="Adresse IP")
    user_agent = models.CharField(max_length=255, blank=True, verbose_name="Navigateur / Appareil")
    details = models.TextField(blank=True, verbose_name="Détails de l'action")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="Date & Heure")

    class Meta:
        db_table = 'piolo_audit_logs'
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journaux d'audit"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {self.action} - {self.email or 'Anonyme'}"


# ── Configuration Dynamique de la Plateforme (White-Label & Global Settings) ──

class ThemeConfig(models.Model):
    """Configuration dynamique globale du thème, du branding, des polices, des textes et des paramètres métier."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ── 1. Branding & Identité Visuelle ─────────────────────────────────
    site_name = models.CharField(max_length=100, default='Piolo Immobilier', verbose_name="Nom de la plateforme")
    site_slogan = models.CharField(max_length=255, default='Trouvez votre logement idéal au Cameroun en toute sécurité', verbose_name="Slogan officiel")
    logo_url = models.CharField(max_length=500, default='/img/logo-piolo-clean.png', verbose_name="URL Logo Clair")
    logo_dark_url = models.CharField(max_length=500, default='/img/logo-piolo-clean.png', verbose_name="URL Logo Sombre")
    favicon_url = models.CharField(max_length=500, default='/favicon.ico', verbose_name="URL Favicon")

    # ── 2. Typographie & Polices ──────────────────────────────────────────
    FONT_HEADING_CHOICES = [
        ('Poppins', 'Poppins (Moderne & Arrondi)'),
        ('Montserrat', 'Montserrat (Structuré & Premium)'),
        ('Outfit', 'Outfit (Luxe & Géométrique)'),
        ('Playfair Display', 'Playfair Display (Prestige & Sérif)'),
        ('Inter', 'Inter (Épuré & Ultra-lisible)'),
        ('Plus Jakarta Sans', 'Plus Jakarta Sans (Tech)'),
    ]
    FONT_BODY_CHOICES = [
        ('Inter', 'Inter (Standard d\'excellence)'),
        ('DM Sans', 'DM Sans (Fluide & Moderne)'),
        ('Roboto', 'Roboto (Classique)'),
        ('Plus Jakarta Sans', 'Plus Jakarta Sans'),
        ('Open Sans', 'Open Sans'),
    ]
    font_heading = models.CharField(max_length=50, choices=FONT_HEADING_CHOICES, default='Poppins', verbose_name="Police des Titres")
    font_body = models.CharField(max_length=50, choices=FONT_BODY_CHOICES, default='Inter', verbose_name="Police du Corps de Texte")
    font_size_base = models.PositiveIntegerField(default=14, verbose_name="Taille de police de base (px)")

    # ── 3. Palette de Couleurs & Styling ────────────────────────────────
    primary_gold = models.CharField(max_length=20, default='#D4AF37', verbose_name="Couleur Or Principale")
    gold_light = models.CharField(max_length=20, default='#F6D365', verbose_name="Couleur Or Lumineux")
    gold_dark = models.CharField(max_length=20, default='#E8C84A', verbose_name="Couleur Or Foncé")
    dark_bg = models.CharField(max_length=20, default='#070503', verbose_name="Fond Sombre Principal")
    card_bg_dark = models.CharField(max_length=20, default='#181510', verbose_name="Fond Sombre des Cartes")
    light_bg = models.CharField(max_length=20, default='#F7F4EC', verbose_name="Fond Clair Principal")
    card_bg_light = models.CharField(max_length=20, default='#FFFFFF', verbose_name="Fond Clair des Cartes")
    border_radius = models.PositiveIntegerField(default=14, verbose_name="Arrondi des Bordures (px)")

    # ── 4. CMS & Contenus Globaux ─────────────────────────────────────────
    hero_title = models.CharField(max_length=255, default='Trouvez la propriété de vos rêves au Cameroun', verbose_name="Titre Hero d'accueil")
    hero_subtitle = models.TextField(default='Des milliers d\'appartements, villas et terrains vérifiés par Piolo à Yaoundé, Douala et partout au Cameroun.', verbose_name="Sous-titre Hero")
    footer_copyright = models.CharField(max_length=255, default='© 2026 Piolo Immobilier. Tous droits réservés.', verbose_name="Copyright Footer")
    contact_email = models.EmailField(default='contact@piolo.cm', verbose_name="Email de contact officiel")
    contact_phone = models.CharField(max_length=30, default='+237 658 32 42 85', verbose_name="Téléphone officiel")
    whatsapp_number = models.CharField(max_length=30, default='+237658324285', verbose_name="Numéro WhatsApp Support")

    # ── 5. Paramètres Métier & Mode Maintenance ───────────────────────────
    welcome_points_tenant = models.PositiveIntegerField(default=50, verbose_name="Points Bienvenue Locataire")
    welcome_points_landlord = models.PositiveIntegerField(default=30, verbose_name="Points Bienvenue Bailleur Approuvé")
    max_kyc_rejections = models.PositiveIntegerField(default=3, verbose_name="Seuil rejets KYC avant blocage")
    maintenance_mode = models.BooleanField(default=False, verbose_name="Mode Maintenance Actif")
    maintenance_message = models.TextField(default='Le site est actuellement en maintenance pour mise à jour. Revenez dans quelques minutes !', verbose_name="Message de maintenance")

    # ── 6. Feature Flags, Intégrations, Notifications & Multilingue ───────
    feature_flags = models.JSONField(default=dict, blank=True, verbose_name="Feature Flags")
    api_keys = models.JSONField(default=dict, blank=True, verbose_name="Clés d'API & Intégrations")
    notifications_config = models.JSONField(default=dict, blank=True, verbose_name="Canaux & Triggers Notifications")
    real_estate_rules = models.JSONField(default=dict, blank=True, verbose_name="Règles métier Immobilières")
    financial_rules = models.JSONField(default=dict, blank=True, verbose_name="Règles Financières & Tarification")
    languages_config = models.JSONField(default=dict, blank=True, verbose_name="Configuration Multilingue")
    active_sections = models.JSONField(default=dict, blank=True, verbose_name="Activité des Sections du site")

    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")

    class Meta:
        db_table = 'piolo_theme_config'
        verbose_name = "Configuration de la Plateforme"
        verbose_name_plural = "Configurations de la Plateforme"

    def __str__(self):
        return f"{self.site_name} Config (Modifié le {self.updated_at.strftime('%Y-%m-%d %H:%M')})"


class ThemeConfigHistory(models.Model):
    """Historique d'audit et versions de restauration de la configuration globale."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Auteur de la modification")
    version = models.PositiveIntegerField(default=1, verbose_name="Numéro de version")
    summary = models.CharField(max_length=255, default="Mise à jour de la configuration", verbose_name="Résumé du changement")
    snapshot = models.JSONField(default=dict, verbose_name="Sauvegarde de la configuration")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de modification")

    class Meta:
        db_table = 'piolo_theme_config_history'
        verbose_name = "Historique de Configuration"
        verbose_name_plural = "Historiques de Configuration"
        ordering = ['-created_at']

    def __str__(self):
        return f"Version #{self.version} par {self.author} le {self.created_at.strftime('%d/%m/%Y %H:%M')}"


# ── 7. Modèles Métier Professionnels, Artisans & Architectes ─────────────────

class ProfessionalProfile(models.Model):
    """Profil professionnel complet d'un artisan, architecte ou entreprise BTP."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='professional_profile',
        verbose_name="Compte Utilisateur",
    )
    business_name = models.CharField(max_length=150, verbose_name="Nom de l'Entreprise ou Artisan")
    primary_trade = models.CharField(max_length=120, default="Artisan du Bâtiment & Habitat", verbose_name="Corps de Métier Principal")
    secondary_trades = models.JSONField(default=list, blank=True, verbose_name="Spécialités & Métiers secondaires")
    city = models.CharField(max_length=100, default="Yaoundé", verbose_name="Ville d'intervention")
    neighborhoods = models.CharField(max_length=255, blank=True, verbose_name="Quartiers d'intervention")
    experience_years = models.CharField(max_length=50, default="5 ans", verbose_name="Années d'expérience")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone Professionnel")
    whatsapp = models.CharField(max_length=30, blank=True, verbose_name="Numéro WhatsApp Pro")
    pricing_indicative = models.CharField(max_length=100, default="Sur devis gratuit", verbose_name="Tarification indicative")
    bio = models.TextField(blank=True, verbose_name="Présentation & Savoir-faire")
    cover_image = models.ImageField(upload_to='pro_covers/', null=True, blank=True, verbose_name="Photo de couverture")
    is_verified = models.BooleanField(default=True, verbose_name="Certifié Piolo")
    is_available = models.BooleanField(default=True, verbose_name="Disponible pour chantiers")
    subscription_plan = models.CharField(max_length=50, default="STANDARD", verbose_name="Plan d'abonnement")
    views_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de consultations du profil")
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse physique de l'Atelier / Bureau")
    latitude = models.FloatField(null=True, blank=True, default=3.8480, verbose_name="Latitude GPS")
    longitude = models.FloatField(null=True, blank=True, default=11.5021, verbose_name="Longitude GPS")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière mise à jour")

    class Meta:
        db_table = 'piolo_pro_profiles'
        verbose_name = "Profil Professionnel"
        verbose_name_plural = "Profils Professionnels"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.business_name} ({self.primary_trade}) - {self.city}"

    @property
    def rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return 5.0
        avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 5.0

    @property
    def reviews_count(self):
        return self.reviews.count()

    @property
    def projects_count(self):
        return self.projects.count()


class ProfessionalProject(models.Model):
    """Projet / Réalisation de chantier publié par un artisan professionnel."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='projects',
        verbose_name="Artisan / Entreprise",
    )
    title = models.CharField(max_length=200, verbose_name="Titre du chantier")
    category = models.CharField(max_length=120, verbose_name="Catégorie / Métier")
    city = models.CharField(max_length=100, default="Yaoundé", verbose_name="Ville / Quartier")
    duration = models.CharField(max_length=100, blank=True, default="2 semaines", verbose_name="Durée des travaux")
    budget = models.CharField(max_length=100, blank=True, verbose_name="Budget indicatif")
    main_image = models.ImageField(upload_to='pro_projects/', null=True, blank=True, verbose_name="Photo Principale (Après)")
    main_image_url = models.CharField(max_length=500, blank=True, verbose_name="URL Photo Principale")
    before_image = models.ImageField(upload_to='pro_projects_before/', null=True, blank=True, verbose_name="Photo Avant travaux")
    before_image_url = models.CharField(max_length=500, blank=True, verbose_name="URL Photo Avant")
    gallery_images = models.JSONField(default=list, blank=True, verbose_name="Galerie multi-photos")
    videos = models.JSONField(default=list, blank=True, verbose_name="Vidéos du chantier & Visites guidées")
    materials = models.JSONField(default=list, blank=True, verbose_name="Matériaux & Équipements utilisés")
    description = models.TextField(blank=True, verbose_name="Descriptif des travaux")
    likes_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de likes")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de publication")

    class Meta:
        db_table = 'piolo_pro_projects'
        verbose_name = "Chantier / Réalisation Pro"
        verbose_name_plural = "Chantiers & Réalisations Pros"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.professional.business_name}"


class ProfessionalProjectLike(models.Model):
    """Likes attribués aux projets / vidéos chantiers des professionnels."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        ProfessionalProject,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name="Chantier liké",
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='pro_project_likes',
        verbose_name="Utilisateur",
        null=True,
        blank=True,
    )
    session_key = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_pro_project_likes'
        verbose_name = "Like Chantier Pro"
        verbose_name_plural = "Likes Chantiers Pro"

    def __str__(self):
        return f"Like sur {self.project.title}"


class ProfessionalReview(models.Model):
    """Avis et note étoilée attribués à un professionnel par un locataire ou un bailleur."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Artisan évalué",
    )
    author_user = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='pro_reviews_written',
        verbose_name="Auteur (Compte)",
    )
    author_name = models.CharField(max_length=120, verbose_name="Nom de l'auteur")
    author_role = models.CharField(max_length=80, default="Locataire Vérifié", verbose_name="Rôle de l'auteur")
    rating = models.PositiveSmallIntegerField(default=5, verbose_name="Note sur 5")
    comment = models.TextField(verbose_name="Commentaire / Avis")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de publication")

    class Meta:
        db_table = 'piolo_pro_reviews'
        verbose_name = "Avis Professionnel"
        verbose_name_plural = "Avis Professionnels"
        ordering = ['-created_at']

    def __str__(self):
        return f"Avis {self.rating}/5 par {self.author_name} pour {self.professional.business_name}"


class ProfessionalQuoteRequest(models.Model):
    """Demande de devis structurée transmise à un artisan."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='quote_requests',
        verbose_name="Artisan destinataire",
    )
    client_user = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='pro_quote_requests_sent',
        verbose_name="Client (Compte)",
    )
    client_name = models.CharField(max_length=120, verbose_name="Nom du client")
    client_phone = models.CharField(max_length=30, verbose_name="Téléphone / WhatsApp du client")
    client_email = models.EmailField(blank=True, verbose_name="Email du client")
    project_type = models.CharField(max_length=120, verbose_name="Type de projet / prestation")
    city = models.CharField(max_length=100, default="Yaoundé", verbose_name="Ville / Quartier")
    budget_estimate = models.CharField(max_length=100, blank=True, verbose_name="Budget estimatif")
    desired_date = models.CharField(max_length=100, blank=True, verbose_name="Délai souhaité")
    description = models.TextField(verbose_name="Description détaillée du besoin")
    photos = models.JSONField(default=list, blank=True, verbose_name="Photos d'inspiration / Plans")
    status = models.CharField(
        max_length=30,
        choices=[
            ('PENDING', 'En attente'),
            ('ACCEPTED', 'Accepté'),
            ('REFUSED', 'Refusé'),
            ('COMPLETED', 'Terminé'),
        ],
        default='PENDING',
        verbose_name="Statut du devis",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de demande")

    class Meta:
        db_table = 'piolo_pro_quote_requests'
        verbose_name = "Demande de Devis Pro"
        verbose_name_plural = "Demandes de Devis Pros"
        ordering = ['-created_at']

    def __str__(self):
        return f"Devis {self.project_type} par {self.client_name} -> {self.professional.business_name}"


# ── Modèles d'Abonnement Locataire VIP & Relocation ─────────────────────────

class TenantPlanType(models.TextChoices):
    STARTER = 'starter', 'Recherche Standard'
    VIP = 'vip', 'Pass Recherche VIP'
    EXPAT = 'expat', 'Relocation & Diaspora'


class SubscriptionBillingCycle(models.TextChoices):
    WEEKLY = 'weekly', 'Hebdomadaire (7 jours)'
    MONTHLY = 'monthly', 'Mensuel (30 jours)'
    YEARLY = 'yearly', 'Annuel (365 jours)'


class SubscriptionStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Actif'
    EXPIRED = 'EXPIRED', 'Expiré'
    CANCELLED = 'CANCELLED', 'Annulé'


class TenantSubscription(models.Model):
    """
    Gère les abonnements Locataire VIP et Relocation Diaspora sur Piolo.
    Permet l'accès prioritaire, les alertes instantanées WhatsApp et les visites illimitées.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='tenant_subscriptions',
        verbose_name="Locataire abonné",
    )
    plan_type = models.CharField(
        max_length=20,
        choices=TenantPlanType.choices,
        default=TenantPlanType.VIP,
        verbose_name="Type de Pass",
        db_index=True,
    )
    billing_cycle = models.CharField(
        max_length=20,
        choices=SubscriptionBillingCycle.choices,
        default=SubscriptionBillingCycle.MONTHLY,
        verbose_name="Cycle de facturation",
    )
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
        verbose_name="Statut",
        db_index=True,
    )
    starts_at = models.DateTimeField(default=timezone.now, verbose_name="Date de début")
    expires_at = models.DateTimeField(verbose_name="Date d'expiration", db_index=True)
    price_paid = models.PositiveIntegerField(default=0, verbose_name="Montant payé (FCFA)")
    payment_method = models.CharField(max_length=30, default="OM", verbose_name="Moyen de paiement")
    phone_number = models.CharField(max_length=30, blank=True, verbose_name="Numéro de paiement")
    transaction_ref = models.CharField(max_length=100, blank=True, verbose_name="Référence transaction")
    auto_renew = models.BooleanField(default=False, verbose_name="Renouvellement automatique")

    # Suivi des relances d'expiration
    reminded_j5 = models.BooleanField(default=False, verbose_name="Rappel J-5 envoyé")
    reminded_j2 = models.BooleanField(default=False, verbose_name="Rappel J-2 envoyé")
    reminded_j0 = models.BooleanField(default=False, verbose_name="Rappel J-0 envoyé")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'piolo_tenant_subscriptions'
        verbose_name = "Abonnement Locataire VIP"
        verbose_name_plural = "Abonnements Locataires VIP"
        ordering = ['-created_at']

    def __str__(self):
        return f"Pass {self.get_plan_type_display()} - {self.user.get_full_name() or self.user.email} ({self.status})"

    @property
    def is_valid(self):
        return self.status == SubscriptionStatus.ACTIVE and self.expires_at > timezone.now()

    @property
    def days_remaining(self):
        if not self.is_valid:
            return 0
        delta = self.expires_at - timezone.now()
        return max(0, delta.days)


