
view_code = """
def tour_viewer_view(request, slug):
    \"\"\"Lecteur de la visite virtuelle 360° pour les locataires et bailleurs.\"\"\"
    from apps.properties.models import VirtualTour, PanoramaScene
    property_obj = get_object_or_404(Property, slug=slug)
    tour = get_object_or_404(VirtualTour, property=property_obj)
    
    scenes = tour.scenes.all().prefetch_related('hotspots', 'hotspots__target_scene')
    
    context = {
        'property': property_obj,
        'tour': tour,
        'scenes': scenes,
    }
    return render(request, 'properties/tour_viewer.html', context)
"""

with open('apps/properties/views.py', 'a', encoding='utf-8') as f:
    f.write(view_code)
