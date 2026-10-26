# Generated manually to keep the publication form and the API choices aligned.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("properties", "0012_searchalert_neighborhood"),
    ]

    operations = [
        migrations.AlterField(
            model_name="property",
            name="property_type",
            field=models.CharField(
                max_length=20,
                verbose_name="Type de bien",
                choices=[
                    ("APPARTEMENT", "Appartement"),
                    ("VILLA", "Villa"),
                    ("STUDIO", "Studio"),
                    ("MAISON", "Maison"),
                    ("MAISON_MEUBLEE", "Maison meublée"),
                    ("VILLA_MEUBLEE", "Villa meublée"),
                    ("PENTHOUSE", "Penthouse"),
                    ("DUPLEX", "Duplex"),
                    ("TRIPLEX", "Triplex"),
                    ("LOFT", "Loft"),
                    ("CHAMBRE", "Chambre"),
                    ("CHAMBRE_MEUBLEE", "Chambre meublée"),
                    ("TERRAIN", "Terrain"),
                    ("BUREAU", "Bureau"),
                    ("BOUTIQUE", "Boutique"),
                    ("IMMEUBLE", "Immeuble"),
                    ("LOCAL_COMMERCIAL", "Local commercial"),
                    ("ENTREPOT", "Entrepôt"),
                    ("RESTAURANT", "Restaurant"),
                    ("HOTEL", "Hôtel"),
                    ("MAISON_D_HOTES", "Maison d'hôtes"),
                    ("MAGASIN", "Magasin"),
                    ("RESIDENCE", "Résidence"),
                    ("CONCESSION", "Concession"),
                    ("BUNGALOW", "Bungalow"),
                    ("FERME", "Ferme / exploitation"),
                ],
            ),
        ),
    ]
