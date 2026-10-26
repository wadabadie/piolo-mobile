import os

models_str = """

# ==============================================================================
# VISITES VIRTUELLES 360° (PANNELLUM)
# ==============================================================================

class VirtualTour(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.OneToOneField(
        Property, 
        on_delete=models.CASCADE, 
        related_name='virtual_tour',
        verbose_name="Bien immobilier"
    )
    is_active = models.BooleanField(default=True, verbose_name="Visite active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'piolo_virtual_tours'
        verbose_name = "Visite Virtuelle 360"
        verbose_name_plural = "Visites Virtuelles 360"

    def __str__(self):
        return f"Visite 360 - {self.property.title}"


class Room360(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tour = models.ForeignKey(
        VirtualTour, 
        on_delete=models.CASCADE, 
        related_name='rooms'
    )
    name = models.CharField(max_length=100, verbose_name="Nom de la pièce (ex: Salon)")
    image = models.ImageField(upload_to='virtual_tours/rooms/', verbose_name="Image 360 (Équirectangulaire)")
    is_default = models.BooleanField(default=False, verbose_name="Pièce de départ")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_room_360'
        verbose_name = "Pièce 360"
        verbose_name_plural = "Pièces 360"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} ({self.tour.property.title})"

    def save(self, *args, **kwargs):
        if self.is_default:
            # S'assurer qu'il n'y a qu'une seule pièce par défaut par tour
            Room360.objects.filter(tour=self.tour, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class Hotspot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_room = models.ForeignKey(
        Room360, 
        on_delete=models.CASCADE, 
        related_name='hotspots_out'
    )
    target_room = models.ForeignKey(
        Room360, 
        on_delete=models.CASCADE, 
        related_name='hotspots_in'
    )
    pitch = models.FloatField(verbose_name="Angle vertical (Pitch)")
    yaw = models.FloatField(verbose_name="Angle horizontal (Yaw)")
    text = models.CharField(max_length=100, blank=True, verbose_name="Texte au survol (ex: Aller à la cuisine)")

    class Meta:
        db_table = 'piolo_hotspot_360'
        verbose_name = "Hotspot 360"
        verbose_name_plural = "Hotspots 360"

    def __str__(self):
        return f"{self.source_room.name} -> {self.target_room.name}"
"""

with open('apps/properties/models.py', 'a', encoding='utf-8') as f:
    f.write(models_str)
