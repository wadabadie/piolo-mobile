
view_code = """
# ==============================================================================
# VISITE VIRTUELLE 360°
# ==============================================================================

@login_required(login_url='accounts:auth')
def tour_editor_view(request, slug):
    \"\"\"Éditeur de la visite virtuelle 360° (côté bailleur).\"\"\"
    from apps.properties.models import VirtualTour, PanoramaScene, PanoramaHotspot
    property_obj = get_object_or_404(Property, slug=slug, owner=request.user)
    
    # Récupérer ou créer le tour
    tour, created = VirtualTour.objects.get_or_create(property=property_obj)
    
    if request.method == 'POST':
        # Gestion d'upload d'une nouvelle pièce
        if 'new_room_image' in request.FILES:
            room_name = request.POST.get('room_name', 'Nouvelle pièce')
            PanoramaScene.objects.create(
                tour=tour,
                name=room_name,
                image=request.FILES['new_room_image'],
                order=tour.scenes.count()
            )
            messages.success(request, f"La pièce '{room_name}' a été ajoutée avec succès.")
            return redirect('properties:tour_editor', slug=slug)
            
        # Gestion de l'ajout d'un hotspot via formulaire caché
        elif 'pitch' in request.POST and 'yaw' in request.POST:
            try:
                source_scene_id = request.POST.get('source_scene_id')
                target_scene_id = request.POST.get('target_scene_id')
                pitch = float(request.POST.get('pitch'))
                yaw = float(request.POST.get('yaw'))
                text = request.POST.get('hotspot_text', 'Aller à la pièce')
                
                source_scene = PanoramaScene.objects.get(id=source_scene_id, tour=tour)
                target_scene = PanoramaScene.objects.get(id=target_scene_id, tour=tour)
                
                PanoramaHotspot.objects.create(
                    scene=source_scene,
                    target_scene=target_scene,
                    pitch=pitch,
                    yaw=yaw,
                    label=text
                )
                messages.success(request, "Hotspot ajouté avec succès.")
            except Exception as e:
                messages.error(request, f"Erreur lors de l'ajout du hotspot : {str(e)}")
            return redirect('properties:tour_editor', slug=slug)

    scenes = tour.scenes.all().prefetch_related('hotspots', 'hotspots__target_scene')
    
    context = {
        'property': property_obj,
        'tour': tour,
        'scenes': scenes,
    }
    return render(request, 'properties/tour_editor.html', context)
"""

with open('apps/properties/views.py', 'a', encoding='utf-8') as f:
    f.write(view_code)
