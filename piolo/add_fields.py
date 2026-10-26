import re

with open('apps/properties/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_fields = """
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
"""

content = content.replace("price_negotiable = models.BooleanField(default=False, verbose_name=\"Prix négociable\")", "price_negotiable = models.BooleanField(default=False, verbose_name=\"Prix négociable\")" + new_fields)

with open('apps/properties/models.py', 'w', encoding='utf-8') as f:
    f.write(content)
