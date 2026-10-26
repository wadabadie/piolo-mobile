# apps/properties/management/commands/train_rent_estimator.py
import pandas as pd
from django.core.management.base import BaseCommand
from apps.properties.models import Property, PropertyStatus, TransactionType
from apps.properties.ml.estimator import get_rent_estimator, RentEstimator


class Command(BaseCommand):
    help = "Entraîne le modèle IA d'estimation de loyer Piolo (Dataset de référence + Données BD réelles)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--samples',
            type=int,
            default=1800,
            help="Nombre d'observations du dataset de référence à générer",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== Démarrage de l'entraînement du Modèle IA Piolo ==="))

        # 1. Extraction des propriétés réelles de la base de données
        db_properties = Property.objects.filter(
            status__in=[PropertyStatus.PUBLISHED, PropertyStatus.RENTED],
            transaction_type__in=[TransactionType.LOCATION, TransactionType.COURTE_DUREE],
            price__gt=15000,
            area__gt=10
        )

        real_count = db_properties.count()
        self.stdout.write(f"Annonces réelles trouvées en base de données : {real_count}")

        extra_rows = []
        for p in db_properties:
            extra_rows.append({
                'city': p.city or 'Yaoundé',
                'neighborhood': p.neighborhood or 'Bastos',
                'property_type': p.property_type or 'APPARTEMENT',
                'surface': float(p.area or 50),
                'bedrooms': int(p.bedrooms or 1),
                'bathrooms': int(p.bathrooms or 1),
                'floors': int(p.floors or 1),
                'standing': p.standing or 'Standard',
                'furnished': int(bool(p.furnished)),
                'has_forage': int(bool(p.water_source in ['FORAGE', 'FORAGE_CAMWATER'])),
                'has_generator': int(bool(p.electricity_type == 'SOLAIRE')),
                'has_security': int(bool(p.security)),
                'has_parking': int(bool(p.parking)),
                'has_balcony': int(bool(p.balcony)),
                'distance_goudron': int(p.distance_goudron or 100),
                'road_access': p.road_access or 'PISTE_PROCHE',
                'monthly_rent': float(p.price)
            })

        extra_df = pd.DataFrame(extra_rows) if extra_rows else None

        # 2. Lancement du pipeline d'entraînement
        estimator = RentEstimator()
        metrics = estimator.train(extra_properties_df=extra_df)

        self.stdout.write(self.style.SUCCESS("\nModèle entraîné et sauvegardé avec succès !"))
        self.stdout.write(f"- Nombre total d'observations : {metrics.get('samples_count')}")
        self.stdout.write(f"- R² Score (Test)              : {metrics.get('r2_score') * 100:.2f}%")
        self.stdout.write(f"- R² Score (Train)             : {metrics.get('r2_train') * 100:.2f}%")
        self.stdout.write(f"- Erreur Moyenne Absolue (MAE) : {metrics.get('mae'):,.0f} FCFA")
        self.stdout.write(f"- Écart-type résiduel          : {metrics.get('residual_std'):,.0f} FCFA")
        self.stdout.write(f"- Date d'entraînement          : {metrics.get('trained_at')}\n")
        self.stdout.write(self.style.NOTICE("Coefficients principaux (Impact en FCFA) :"))
        for k, v in list(metrics.get('coefficients', {}).items())[:8]:
            self.stdout.write(f"  • {k:20s}: {v:+,.2f} FCFA")
