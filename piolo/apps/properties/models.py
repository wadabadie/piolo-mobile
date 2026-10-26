# apps/properties/models.py
import uuid
import re
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.accounts.models import CustomUser
from django.utils import timezone
from django.db import models as db_models

def sanitize_contact_info(text):
    """
    Retire et masque automatiquement les numéros de téléphone (camerounais et internationaux)
    dans les titres et descriptions pour protéger les bailleurs et sécuriser les échanges via Piolo.
    """
    if not text:
        return text
    # Motifs de téléphones camerounais (6XX XX XX XX, 2XX XX XX XX, +237...) ou séquences de chiffres
    phone_pattern = r'(\+?237\s*)?[62]\s*[0-9](\s*[\.\-_/]?\s*[0-9]){7}'
    sanitized = re.sub(phone_pattern, '[Contact via Piolo]', text)
    sanitized = re.sub(r'\b\d{9,12}\b', '[Contact via Piolo]', sanitized)
    return sanitized

class PropertyStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Brouillon'
    PENDING = 'PENDING', 'En attente de validation'
    PUBLISHED = 'PUBLISHED', 'Publié'
    RENTED = 'RENTED', 'Loué'
    ARCHIVED = 'ARCHIVED', 'Archivé'

class TransactionType(models.TextChoices):
    LOCATION = 'LOCATION', 'Location'
    VENTE = 'VENTE', 'Vente'
    COURTE_DUREE = 'COURTE_DUREE', 'Courte durée'

class PropertyType(models.TextChoices):
    APPARTEMENT = 'APPARTEMENT', 'Appartement'
    VILLA = 'VILLA', 'Villa'
    STUDIO = 'STUDIO', 'Studio'
    MAISON = 'MAISON', 'Maison'
    MAISON_MEUBLEE = 'MAISON_MEUBLEE', 'Maison meublée'
    VILLA_MEUBLEE = 'VILLA_MEUBLEE', 'Villa meublée'
    PENTHOUSE = 'PENTHOUSE', 'Penthouse'
    DUPLEX = 'DUPLEX', 'Duplex'
    TRIPLEX = 'TRIPLEX', 'Triplex'
    LOFT = 'LOFT', 'Loft'
    CHAMBRE = 'CHAMBRE', 'Chambre'
    CHAMBRE_MEUBLEE = 'CHAMBRE_MEUBLEE', 'Chambre meublée'
    TERRAIN = 'TERRAIN', 'Terrain'
    BUREAU = 'BUREAU', 'Bureau'
    BOUTIQUE = 'BOUTIQUE', 'Boutique'
    IMMEUBLE = 'IMMEUBLE', 'Immeuble'
    LOCAL_COMMERCIAL = 'LOCAL_COMMERCIAL', 'Local commercial'
    ENTREPOT = 'ENTREPOT', 'Entrepôt'
    RESTAURANT = 'RESTAURANT', 'Restaurant'
    HOTEL = 'HOTEL', 'Hôtel'
    MAISON_D_HOTES = 'MAISON_D_HOTES', "Maison d'hôtes"
    MAGASIN = 'MAGASIN', 'Magasin'
    RESIDENCE = 'RESIDENCE', 'Résidence'
    CONCESSION = 'CONCESSION', 'Concession'
    BUNGALOW = 'BUNGALOW', 'Bungalow'
    FERME = 'FERME', 'Ferme / exploitation'

# ── Choix spécifiques au terrain camerounais (Indice de Vie du Quartier) ──
class WaterSourceType(models.TextChoices):
    FORAGE = 'FORAGE', 'Forage privé'
    CAMWATER = 'CAMWATER', 'Réseau CAMWATER'
    FORAGE_CAMWATER = 'FORAGE_CAMWATER', 'Forage + CAMWATER'
    CITERNE = 'CITERNE', 'Citerne / Réserve'

class ElectricityType(models.TextChoices):
    PREPAYE = 'PREPAYE', 'Compteur prépayé individuel'
    POSTPAYE = 'POSTPAYE', 'Compteur classique (Postpayé)'
    PARTAGE = 'PARTAGE', 'Compteur partagé / divisionnaire'
    SOLAIRE = 'SOLAIRE', 'Solaire / Groupe de secours'

class RoadAccessType(models.TextChoices):
    GOUDRON_DIRECT = 'GOUDRON_DIRECT', 'Goudron direct (Barrière)'
    PISTE_PROCHE = 'PISTE_PROCHE', 'Piste aménagée (< 100m)'
    PISTE_MOYENNE = 'PISTE_MOYENNE', 'Piste (100m - 500m)'
    PISTE_DIFFICILE = 'PISTE_DIFFICILE', 'Piste en terre (> 500m)'

class NetworkQualityType(models.TextChoices):
    EXCELLENT = 'EXCELLENT', 'MTN & Orange 4G/5G parfaits'
    BON = 'BON', 'Réseau stable'
    MOYEN = 'MOYEN', 'Réseau moyen à l\'intérieur'

class FloodRiskType(models.TextChoices):
    NUL = 'NUL', 'Risque nul (Hauteur)'
    FAIBLE = 'FAIBLE', 'Zone drainée'
    MOYEN = 'MOYEN', 'Zone basse'

class TransportAccessType(models.TextChoices):
    DEPOT_MOTO_IMMEDIAT = 'DEPOT_MOTO_IMMEDIAT', 'Dépôt moto & Taxis immédiats'
    MARCHE_COURTE = 'MARCHE_COURTE', 'Taxis à moins de 5 min'
    ELOIGNE = 'ELOIGNE', 'Zone résidentielle calme / isolée'

class Property(models.Model):
    """Annonce immobilière publiée par un bailleur."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    owner = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='properties',
        verbose_name="Bailleur",
        limit_choices_to={'role': 'BAILLEUR'}
    )
    
    title = models.CharField(max_length=200, verbose_name="Titre de l'annonce")
    slug = models.SlugField(max_length=250, unique=True, blank=True, editable=False)
    description = models.TextField(verbose_name="Description détaillée", blank=True, default='')
    
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
        default=TransactionType.LOCATION,
        verbose_name="Type de transaction"
    )
    
    property_type = models.CharField(
        max_length=20,
        choices=PropertyType.choices,
        verbose_name="Type de bien"
    )
    
    address = models.CharField(max_length=255, verbose_name="Adresse complète")
    city = models.CharField(max_length=100, verbose_name="Ville")
    neighborhood = models.CharField(max_length=100, blank=True, verbose_name="Quartier")
    
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True, verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6,
        null=True, blank=True, verbose_name="Longitude"
    )
    
    price = models.PositiveBigIntegerField(verbose_name="Prix (FCFA)")
    price_negotiable = models.BooleanField(default=False, verbose_name="Prix négociable")
    # Nouveaux champs financiers
    avance_mois = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Mois d'avance")
    caution_mois = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Mois de caution")
    tax_regime = models.CharField(max_length=50, blank=True, verbose_name="Régime fiscal")
    
    # Nouvelles surfaces
    surface_sejour = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Surface séjour (m²)")
    surface_terrain = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Surface terrain (m²)")
    surface_terrasse = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Surface terrasse (m²)")
    
    # Nouvelles pièces
    wc = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Nombre de WC")
    cuisine = models.CharField(max_length=100, blank=True, verbose_name="Cuisine (type/équipement)")
    
    # Extérieurs et autres
    jardin = models.CharField(max_length=100, blank=True, verbose_name="Jardin")
    annee_construction = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Année de construction")
    standing = models.CharField(max_length=100, blank=True, verbose_name="Standing")
    etat_general = models.CharField(max_length=100, blank=True, verbose_name="État général")
    ascenseur = models.CharField(max_length=100, blank=True, verbose_name="Ascenseur")
    type_stationnement = models.CharField(max_length=100, blank=True, verbose_name="Type de stationnement")
    nombre_places_parking = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Nombre de places de parking")
    nombre_etages = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Nombre d'étages du bien")

    
    area = models.PositiveSmallIntegerField(verbose_name="Surface (m²)")
    bedrooms = models.PositiveSmallIntegerField(default=0, verbose_name="Chambres")
    bathrooms = models.PositiveSmallIntegerField(default=1, verbose_name="Salles de bain")
    floors = models.PositiveSmallIntegerField(default=1, verbose_name="Étages")
    
    furnished = models.BooleanField(default=False, verbose_name="Meublé")
    balcony = models.BooleanField(default=False, verbose_name="Balcon/Terrasse")
    parking = models.BooleanField(default=False, verbose_name="Parking")
    security = models.BooleanField(default=False, verbose_name="Sécurité 24/7")
    water = models.BooleanField(default=True, verbose_name="Eau courante")
    electricity = models.BooleanField(default=True, verbose_name="Électricité")
    
    # ── Indice de Vie du Quartier (Terrain 237) — Tous optionnels ──
    water_source = models.CharField(
        max_length=50, choices=WaterSourceType.choices,
        null=True, blank=True, verbose_name="Source d'eau"
    )
    electricity_type = models.CharField(
        max_length=50, choices=ElectricityType.choices,
        null=True, blank=True, verbose_name="Type d'électricité / Compteur"
    )
    road_access = models.CharField(
        max_length=50, choices=RoadAccessType.choices,
        null=True, blank=True, verbose_name="Accès routier"
    )
    distance_goudron = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Distance du goudron (mètres)"
    )
    network_quality = models.CharField(
        max_length=50, choices=NetworkQualityType.choices,
        null=True, blank=True, verbose_name="Qualité réseau mobile"
    )
    flood_risk = models.CharField(
        max_length=50, choices=FloodRiskType.choices,
        null=True, blank=True, verbose_name="Risque d'inondation"
    )
    transport_access = models.CharField(
        max_length=50, choices=TransportAccessType.choices,
        null=True, blank=True, verbose_name="Accès aux transports"
    )
    
    main_image = models.ImageField(
        upload_to='properties/main/',
        verbose_name="Image principale"
    )
    
    video_reel = models.FileField(
        upload_to='property_reels/',
        null=True, blank=True,
        verbose_name="Vidéo Découverte",
        help_text="Vidéo verticale courte (max 60s) pour l'onglet Découverte"
    )
    
    reel_description = models.CharField(
        max_length=150,
        null=True, blank=True,
        verbose_name="Légende de la vidéo",
        help_text="Petite description attrayante pour le mode découverte"
    )
    
    status = models.CharField(
        max_length=20,
        choices=PropertyStatus.choices,
        default=PropertyStatus.PENDING,
        verbose_name="Statut"
    )
    
    is_published = models.BooleanField(default=False, verbose_name="Est publié")
    is_featured = models.BooleanField(default=False, verbose_name="Mise en avant")
    is_boosted = models.BooleanField(default=False, verbose_name="Boosté")
    boost_type = models.CharField(
        max_length=20, blank=True, default='',
        verbose_name="Type de boost actif",
        help_text="Ex: flash_48h, vedette_7j, multiboost_30j — mis à jour automatiquement"
    )
    boost_expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Fin du boost")

    # ── Contrôle de Trafic & Modération du Mode Découverte (Reels) ──────
    is_in_discovery = models.BooleanField(
        default=True,
        verbose_name="Diffusé en Découverte",
        help_text="Active ou bloque la vidéo du flux du mode Découverte"
    )
    is_discovery_featured = models.BooleanField(
        default=False,
        verbose_name="Vedette Découverte",
        help_text="Épingle et propulse la vidéo en tête du flux Découverte"
    )
    discovery_priority = models.IntegerField(
        default=0,
        verbose_name="Score de Priorité Découverte",
        help_text="Poids de recommandation pour l'algorithme Découverte"
    )
    discovery_views_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Vues du Reel Découverte"
    )
    discovery_likes_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Likes du Reel Découverte"
    )
    discovery_blocked_reason = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name="Motif de restriction Découverte"
    )

    views_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de vues")
    favorites_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de favoris")
    
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de publication")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'piolo_properties'
        verbose_name = 'Annonce immobilière'
        verbose_name_plural = 'Annonces immobilières'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['city', 'property_type']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.title} — {self.city}"
    
    def save(self, *args, **kwargs):
        if self.title:
            self.title = sanitize_contact_info(self.title)
        if self.description:
            self.description = sanitize_contact_info(self.description)
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Property.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    @property
    def location_string(self):
        parts = [self.neighborhood] if self.neighborhood else []
        parts.append(self.city)
        return ", ".join(filter(None, parts)) or "Localisation non précisée"
    
    @property
    def amenities_list(self):
        amenities = []
        if self.furnished: amenities.append("Meublé")
        if self.balcony: amenities.append("Balcon/Terrasse")
        if self.parking: amenities.append("Parking")
        if self.security: amenities.append("Sécurité 24/7")
        if self.water: amenities.append("Eau courante")
        if self.electricity: amenities.append("Électricité")
        return amenities
    
# apps/properties/models.py — ajouter à la suite du modèle Property

class PropertyImage(models.Model):
    """Image secondaire d'un bien immobilier (galerie)."""
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Bien"
    )
    image = models.ImageField(
        upload_to='properties/gallery/%Y/%m/',
        verbose_name="Image"
    )
    caption = models.CharField(max_length=150, blank=True, verbose_name="Légende")
    order = models.PositiveSmallIntegerField(default=0, verbose_name="Ordre")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_property_images'
        verbose_name = 'Image secondaire'
        verbose_name_plural = 'Images secondaires'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Image #{self.order} — {self.property.title}"
    





# apps/properties/models.py — ajouter après PropertyImage

class VisitRequest(models.Model):
    """Demande de visite d'un bien — coûte 20 pts au locataire."""

    class Status(models.TextChoices):
        PENDING   = 'PENDING',   'En attente'
        CONFIRMED = 'CONFIRMED', 'Confirmée'
        REFUSED   = 'REFUSED',   'Refusée'
        CANCELLED = 'CANCELLED', 'Annulée'

    property    = models.ForeignKey(
        'Property', on_delete=models.CASCADE,
        related_name='visit_requests', verbose_name="Bien"
    )
    tenant      = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='visit_requests', verbose_name="Locataire"
    )
    status      = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.PENDING, verbose_name="Statut"
    )
    requested_date  = models.DateField(verbose_name="Date souhaitée")
    requested_time  = models.TimeField(null=True, blank=True, verbose_name="Heure souhaitée")
    message         = models.TextField(blank=True, verbose_name="Message au bailleur")
    
    # Réponse du bailleur
    bailleur_note   = models.TextField(blank=True, verbose_name="Note du bailleur")
    confirmed_date  = models.DateField(null=True, blank=True, verbose_name="Date confirmée")
    confirmed_time  = models.TimeField(null=True, blank=True, verbose_name="Heure confirmée")

    # Points
    points_deducted = models.BooleanField(default=False, verbose_name="Points déduits")

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'piolo_visit_requests'
        verbose_name = 'Demande de visite'
        verbose_name_plural = 'Demandes de visite'
        ordering = ['-created_at']

    def __str__(self):
        return f"Visite {self.property.title} — {self.tenant} ({self.status})"

    def confirm(self, confirmed_date=None, confirmed_time=None, note=''):
        self.status         = self.Status.CONFIRMED
        self.confirmed_date = confirmed_date or self.requested_date
        self.confirmed_time = confirmed_time or self.requested_time
        self.bailleur_note  = note
        self.save(update_fields=['status', 'confirmed_date', 'confirmed_time', 'bailleur_note', 'updated_at'])

    def refuse(self, note=''):
        self.status        = self.Status.REFUSED
        self.bailleur_note = note
        self.save(update_fields=['status', 'bailleur_note', 'updated_at'])

    def cancel(self):
        self.status = self.Status.CANCELLED
        self.save(update_fields=['status', 'updated_at'])


class LocationRequest(models.Model):
    """
    Demande de location — coûte 20 pts au locataire.
    Inclut un dossier : CNI, justificatif de revenus, garant.
    """

    class Status(models.TextChoices):
        PENDING   = 'PENDING',   'En attente'
        REVIEWING = 'REVIEWING', 'En cours d\'examen'
        ACCEPTED  = 'ACCEPTED',  'Acceptée'
        REFUSED   = 'REFUSED',   'Refusée'
        CANCELLED = 'CANCELLED', 'Annulée'

    property = models.ForeignKey(
        'Property', on_delete=models.CASCADE,
        related_name='location_requests', verbose_name="Bien"
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='location_requests', verbose_name="Locataire"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.PENDING, verbose_name="Statut"
    )

    # ── Infos dossier ──────────────────────────────────────────
    move_in_date    = models.DateField(verbose_name="Date d'entrée souhaitée")
    lease_duration  = models.PositiveSmallIntegerField(
        default=12, verbose_name="Durée souhaitée (mois)"
    )
    tenant_count    = models.PositiveSmallIntegerField(
        default=1, verbose_name="Nombre d'occupants"
    )
    monthly_income  = models.DecimalField(
        max_digits=12, decimal_places=0,
        null=True, blank=True, verbose_name="Revenus mensuels (FCFA)"
    )
    profession      = models.CharField(max_length=150, blank=True, verbose_name="Profession")
    employer        = models.CharField(max_length=150, blank=True, verbose_name="Employeur")
    message         = models.TextField(blank=True, verbose_name="Message de motivation")

    # ── Pièces justificatives ──────────────────────────────────
    cni_front       = models.FileField(
        upload_to='requests/cni/%Y/%m/', null=True, blank=True,
        verbose_name="CNI recto"
    )
    cni_back        = models.FileField(
        upload_to='requests/cni/%Y/%m/', null=True, blank=True,
        verbose_name="CNI verso"
    )
    income_proof    = models.FileField(
        upload_to='requests/income/%Y/%m/', null=True, blank=True,
        verbose_name="Justificatif de revenus"
    )

    # ── Garant ────────────────────────────────────────────────
    has_guarantor       = models.BooleanField(default=False, verbose_name="A un garant")
    guarantor_name      = models.CharField(max_length=150, blank=True, verbose_name="Nom du garant")
    guarantor_phone     = models.CharField(max_length=20, blank=True, verbose_name="Téléphone garant")
    guarantor_relation  = models.CharField(max_length=100, blank=True, verbose_name="Lien avec le garant")
    guarantor_income    = models.DecimalField(
        max_digits=12, decimal_places=0,
        null=True, blank=True, verbose_name="Revenus garant (FCFA)"
    )
    guarantor_cni       = models.FileField(
        upload_to='requests/guarantor/%Y/%m/', null=True, blank=True,
        verbose_name="CNI garant"
    )

    # ── Réponse bailleur ──────────────────────────────────────
    bailleur_note   = models.TextField(blank=True, verbose_name="Note du bailleur")

    # ── Points ────────────────────────────────────────────────
    points_deducted = models.BooleanField(default=False)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'properties_locationrequest'
        verbose_name = 'Demande de location'
        verbose_name_plural = 'Demandes de location'
        ordering = ['-created_at']

    def __str__(self):
        return f"Location {self.property.title} — {self.tenant} ({self.status})"

    def accept(self, note=''):
        self.status        = self.Status.ACCEPTED
        self.bailleur_note = note
        self.save(update_fields=['status', 'bailleur_note', 'updated_at'])

    def refuse(self, note=''):
        self.status        = self.Status.REFUSED
        self.bailleur_note = note
        self.save(update_fields=['status', 'bailleur_note', 'updated_at'])

    def cancel(self):
        self.status = self.Status.CANCELLED
        self.save(update_fields=['status', 'updated_at'])

    # @property
    # def dossier_completion(self):
    #     """Retourne le pourcentage de complétude du dossier (0-100)."""
    #     fields = [
    #         bool(self.cni_front),
    #         bool(self.cni_back),
    #         bool(self.income_proof),
    #         bool(self.monthly_income),
    #         bool(self.profession),
    #         bool(self.move_in_date),
    #     ]
    #     return int(sum(fields) / len(fields) * 100)
    

    def get_dossier_completion(self):
        """Retourne le pourcentage de complétude du dossier (0-100)."""
        fields = [
            bool(self.cni_front),
            bool(self.cni_back),
            bool(self.income_proof),
            bool(self.monthly_income),
            bool(self.profession),
            bool(self.move_in_date),
        ]
        return int(sum(fields) / len(fields) * 100)


class ShortStayBooking(models.Model):
    """
    Réservation de court séjour (meublés / nuitées).
    Gère aussi bien les réservations faites par les voyageurs que les blocages de dates par le bailleur.
    """
    class Status(models.TextChoices):
        PENDING   = 'PENDING',   'En attente'
        CONFIRMED = 'CONFIRMED', 'Confirmé'
        COMPLETED = 'COMPLETED', 'Séjour terminé'
        REFUSED   = 'REFUSED',   'Refusé'
        CANCELLED = 'CANCELLED', 'Annulé'

    property = models.ForeignKey(
        'Property', on_delete=models.CASCADE,
        related_name='short_stay_bookings', verbose_name="Bien meublé"
    )
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='short_stay_bookings', verbose_name="Voyageur"
    )
    check_in_date = models.DateField(verbose_name="Date d'arrivée")
    check_out_date = models.DateField(verbose_name="Date de départ")
    guests_count = models.PositiveSmallIntegerField(default=1, verbose_name="Nombre de voyageurs")
    nights_count = models.PositiveIntegerField(default=1, verbose_name="Nombre de nuitées")
    total_price = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Prix total (FCFA)")
    
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.PENDING, verbose_name="Statut"
    )

    is_blocked_by_host = models.BooleanField(
        default=False, 
        verbose_name="Bloqué manuellement par l'hôte"
    )
    block_reason = models.CharField(
        max_length=150, blank=True,
        verbose_name="Motif du blocage"
    )

    guest_name = models.CharField(max_length=150, blank=True, verbose_name="Nom voyageur")
    guest_phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone voyageur")
    guest_note = models.TextField(blank=True, verbose_name="Message du voyageur")
    host_note = models.TextField(blank=True, verbose_name="Note de l'hôte")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'piolo_short_stay_bookings'
        verbose_name = 'Réservation Court Séjour'
        verbose_name_plural = 'Réservations Courts Séjours'
        ordering = ['-created_at']

    def __str__(self):
        if self.is_blocked_by_host:
            return f"Blocage {self.property.title} : {self.check_in_date} -> {self.check_out_date}"
        return f"Séjour {self.property.title} : {self.check_in_date} -> {self.check_out_date} ({self.status})"


    


# apps/properties/models.py

# ═══════════════════════════════════════════════════════════════════════
# VISITES VIRTUELLES 360°
# ═══════════════════════════════════════════════════════════════════════

class VirtualTour(models.Model):
    """Tour virtuel 360° d'un bien immobilier"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='virtual_tours')
    name = models.CharField(max_length=100, default="Visite virtuelle")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Visite virtuelle"
        verbose_name_plural = "Visites virtuelles"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.property.title}"


class PanoramaScene(models.Model):
    """Une scène/panorama 360° (une pièce)"""
    tour = models.ForeignKey(VirtualTour, on_delete=models.CASCADE, related_name='scenes')
    name = models.CharField(max_length=100, help_text="Nom de la pièce (ex: Salon, Cuisine)")
    image = models.ImageField(upload_to='panoramas/%Y/%m/%d/')
    order = models.IntegerField(default=0, help_text="Ordre d'affichage")
    config_data = models.JSONField(blank=True, null=True, help_text="Configuration des hotspots")
    
    class Meta:
        ordering = ['order']
        verbose_name = "Scène panorama"
        verbose_name_plural = "Scènes panorama"
    
    def __str__(self):
        return f"{self.name} - {self.tour.name}"


class PanoramaHotspot(models.Model):
    """Point de navigation entre les scènes"""
    scene = models.ForeignKey(PanoramaScene, on_delete=models.CASCADE, related_name='hotspots')
    target_scene = models.ForeignKey(
        PanoramaScene, 
        on_delete=models.CASCADE, 
        related_name='incoming_hotspots',
        help_text="Scène vers laquelle ce hotspot mène"
    )
    yaw = models.FloatField(help_text="Position horizontale (-180 à 180)")
    pitch = models.FloatField(help_text="Position verticale (-90 à 90)")
    
    TYPE_CHOICES = [
        ('scene', 'Vers une autre pièce'),
        ('info', 'Information'),
        ('link', 'Lien externe'),
    ]
    hotspot_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='scene')
    label = models.CharField(max_length=100, blank=True, help_text="Texte affiché au survol")
    
    class Meta:
        verbose_name = "Hotspot"
        verbose_name_plural = "Hotspots"
    
    def __str__(self):
        return f"{self.label} - {self.scene.name} → {self.target_scene.name}"
    

class Favorite(models.Model):
    """Bien mis en favori par un locataire."""
    user     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='favorites'
    )
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_favorites'
        unique_together = ('user', 'property')

    def __str__(self):
        return f"{self.user} ♥ {self.property.title}"


class SearchAlert(models.Model):
    """Alerte de recherche sauvegardée par un locataire."""
    user           = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='search_alerts'
    )
    title          = models.CharField(max_length=100, verbose_name="Nom de l'alerte")
    city           = models.CharField(max_length=100, blank=True)
    neighborhood   = models.CharField(max_length=100, blank=True, verbose_name="Quartier")
    property_type  = models.CharField(max_length=20, blank=True)
    transaction_type = models.CharField(max_length=20, blank=True, default='LOCATION')
    min_price      = models.PositiveBigIntegerField(null=True, blank=True)
    max_price      = models.PositiveBigIntegerField(null=True, blank=True)
    min_area       = models.PositiveSmallIntegerField(null=True, blank=True)
    is_active      = models.BooleanField(default=True)
    last_notified  = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_search_alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.user}"

    def matches(self, property_obj):
        """Vérifie si un bien correspond à cette alerte."""
        if self.city and self.city.lower() not in property_obj.city.lower():
            return False
        if self.neighborhood and (not property_obj.neighborhood or self.neighborhood.lower() not in property_obj.neighborhood.lower()):
            return False
        if self.property_type and self.property_type != property_obj.property_type:
            return False
        if self.transaction_type and self.transaction_type != property_obj.transaction_type:
            return False
        if self.min_price and property_obj.price < self.min_price:
            return False
        if self.max_price and property_obj.price > self.max_price:
            return False
        if self.min_area and property_obj.area < self.min_area:
            return False
        return True


# ══════════════════════════════════════════════════════════════════════════════
# ── BOOST D'ANNONCES (Système de mise en avant payant) ───────────────────────
# ══════════════════════════════════════════════════════════════════════════════

class BoostType(models.TextChoices):
    FLASH_48H      = 'flash_48h',     'Flash 48h — Exposition maximale 2 jours'
    VEDETTE_7J     = 'vedette_7j',    'Vedette 7 jours — Top des résultats'
    MULTIBOOST_30J = 'multiboost_30j','MultiBoost 30 jours — Visibilité longue durée'


BOOST_DURATIONS = {
    'flash_48h':      2,
    'vedette_7j':     7,
    'multiboost_30j': 30,
}

BOOST_POINT_COSTS = {
    'flash_48h':      15,
    'vedette_7j':     30,
    'multiboost_30j': 75,
}


class PropertyBoost(models.Model):
    """
    Campagne de boost d'une annonce immobilière.
    Chaque boost = une ligne en base avec la durée, les dates d'activation/expiration,
    et les métriques de vues générées par le boost.
    """
    property     = models.ForeignKey(
        Property, on_delete=models.CASCADE,
        related_name='boosts', verbose_name="Bien boosté"
    )
    owner        = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='property_boosts', verbose_name="Bailleur"
    )
    boost_type   = models.CharField(
        max_length=20, choices=BoostType.choices,
        default=BoostType.VEDETTE_7J, verbose_name="Type de boost"
    )
    points_spent = models.PositiveSmallIntegerField(default=0, verbose_name="Points dépensés")
    activated_at = models.DateTimeField(auto_now_add=True, verbose_name="Activé le")
    expires_at   = models.DateTimeField(verbose_name="Expire le")
    is_active    = models.BooleanField(default=True, verbose_name="Actif")
    boosted_views = models.PositiveIntegerField(default=0, verbose_name="Vues générées par le boost")

    class Meta:
        db_table = 'piolo_property_boosts'
        verbose_name = 'Boost d\'annonce'
        verbose_name_plural = 'Boosts d\'annonces'
        ordering = ['-activated_at']
        indexes = [
            models.Index(fields=['property', 'is_active']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"[{self.boost_type}] {self.property.title} → exp. {self.expires_at:%d/%m/%Y}"

    def is_boost_valid(self):
        """Retourne True si le boost est encore actif et non expiré."""
        return self.is_active and self.expires_at > timezone.now()

    def save(self, *args, **kwargs):
        # Si pas encore d'expire_at, le calculer selon le type
        if not self.expires_at:
            days = BOOST_DURATIONS.get(self.boost_type, 7)
            self.expires_at = timezone.now() + timezone.timedelta(days=days)
        super().save(*args, **kwargs)
        # Mettre à jour les champs is_boosted / boost_type / boost_expires_at sur Property
        _sync_property_boost(self.property)


def _sync_property_boost(prop):
    """Recalcule et synchronise l'état de boost actif sur la Property."""
    now = timezone.now()
    active_boost = PropertyBoost.objects.filter(
        property=prop, is_active=True, expires_at__gt=now
    ).order_by('-expires_at').first()
    if active_boost:
        Property.objects.filter(pk=prop.pk).update(
            is_boosted=True,
            boost_type=active_boost.boost_type,
            boost_expires_at=active_boost.expires_at
        )
    else:
        Property.objects.filter(pk=prop.pk).update(
            is_boosted=False,
            boost_type='',
            boost_expires_at=None
        )


# ── Mandats de Gestion Déléguée & Conciergerie Piolo Signature ────────────────

class ConciergeMandateStatus(models.TextChoices):
    PENDING = 'PENDING', 'En attente de prise en charge'
    SHOOTING_PLANNED = 'SHOOTING_PLANNED', 'Équipe technique planifiée'
    VISITS_IN_PROGRESS = 'VISITS_IN_PROGRESS', 'Visites & Candidatures en cours'
    TENANT_SELECTED = 'TENANT_SELECTED', 'Locataire sélectionné & Bail prêt'
    COMPLETED = 'COMPLETED', 'Mandat actif & Clés remises'
    CANCELLED = 'CANCELLED', 'Annulé'


class ConciergePackageType(models.TextChoices):
    FULL_MANAGEMENT = 'full_management', 'Gestion Déléguée Intégrale'
    SHOOTING_ONLY = 'shooting_only', 'Captation 360° & Production Média'


class ConciergeMandate(models.Model):
    id = models.CharField(max_length=50, primary_key=True, editable=False)
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='concierge_mandates',
        verbose_name="Bailleur"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='concierge_mandates',
        verbose_name="Bien concerné"
    )
    property_title = models.CharField(max_length=255, verbose_name="Titre du bien")
    city = models.CharField(max_length=100, default='Douala', verbose_name="Ville")
    neighborhood = models.CharField(max_length=100, default='Bonapriso', verbose_name="Quartier")
    
    package_type = models.CharField(
        max_length=40,
        choices=ConciergePackageType.choices,
        default=ConciergePackageType.FULL_MANAGEMENT,
        verbose_name="Formule choisie"
    )
    package_name = models.CharField(max_length=150, default='Gestion Déléguée Intégrale Piolo Signature')
    price = models.PositiveIntegerField(default=19000, verbose_name="Montant payé (FCFA)")
    
    status = models.CharField(
        max_length=40,
        choices=ConciergeMandateStatus.choices,
        default=ConciergeMandateStatus.SHOOTING_PLANNED,
        verbose_name="Statut du mandat"
    )
    status_label = models.CharField(max_length=150, default='Équipe technique planifiée')
    progress_percent = models.PositiveIntegerField(default=25, verbose_name="Avancement (%)")
    
    lead_agent = models.CharField(max_length=150, default='Équipe Logistique Piolo', verbose_name="Agent responsable")
    assigned_agent_phone = models.CharField(max_length=30, default='+237 658 32 42 85', verbose_name="Contact de l'agent")
    
    contact_name = models.CharField(max_length=150, blank=True, verbose_name="Nom du propriétaire")
    contact_phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone de contact")
    payment_phone = models.CharField(max_length=30, blank=True, verbose_name="Numéro de paiement")
    payment_operator = models.CharField(max_length=20, default='OM', verbose_name="Opérateur de paiement")
    
    preferred_date = models.CharField(max_length=50, blank=True, verbose_name="Date souhaitée")
    time_slot = models.CharField(max_length=50, default='morning', verbose_name="Créneau horaire")
    notes = models.TextField(blank=True, verbose_name="Instructions / Notes d'accès")
    
    visits_conducted = models.PositiveIntegerField(default=0, verbose_name="Visites effectuées")
    qualified_candidates = models.PositiveIntegerField(default=0, verbose_name="Candidats qualifiés")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    class Meta:
        db_table = 'piolo_concierge_mandates'
        verbose_name = 'Mandat de conciergerie'
        verbose_name_plural = 'Mandats de conciergerie'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            import random
            self.id = f"CONC-2026-{random.randint(100, 999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.id}] {self.property_title} — {self.landlord.email}"


