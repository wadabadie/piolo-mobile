# apps/properties/urls.py
from django.urls import path, include
from . import views

app_name = 'properties'

urlpatterns = [
    # ==========================================
    # 🌐 ROUTES WEB (Templates Django)
    # ==========================================
     # Public
     # ── Routes spécifiques AVANT les routes avec paramètre ────────────────
    # ⚠️  ORDRE CRITIQUE : 'create/' doit être déclaré AVANT '<slug:slug>/'
    # sinon Django intercepte "create" comme un slug → 404 sur detail_view
 
    path('',        views.property_list_view,   name='list'),
    path('decouverte/', views.decouverte_view, name='decouverte'),
    path('map/', views.interactive_map_view, name='interactive_map'),
    path('create/', views.property_create_view, name='create'),
 
    # Routes Bailleur (gestion)
    path('api/create/', views.property_create_api, name='api_create'),
    path('api/', include('apps.properties.api.urls')),
 
    # ── Routes annexes (doivent être AVANT le slug) ──────────────────────
    path('favorite/<uuid:property_id>/',     views.toggle_favorite,      name='toggle_favorite'),
    path('favorites/',                       views.favorites_list_view,  name='favorites_list'),
    path('visits/',                          views.visits_list_view,     name='visits_list'),
    path('messages/',                        views.messages_list_view,   name='messages_list'),
    path('alerts/',                          views.search_alerts_view,   name='search_alerts'),
    path('alerts/create/',                   views.create_search_alert,  name='alert_create'),
    path('alerts/<int:alert_id>/delete/',    views.delete_search_alert,  name='alert_delete'),
    
    # Demandes de visite
    path('visit/create/<uuid:property_id>/',    views.visit_request_create, name='visit_create'),
    path('visit/action/<int:visit_id>/',        views.visit_request_action, name='visit_action'),
    path('visit/<int:pk>/detail/',              views.visit_detail_view,    name='visit_detail'),

    # Demandes de location
    path('location/create/<uuid:property_id>/', views.location_request_create, name='location_create'),
    path('location/action/<int:location_id>/',  views.location_request_action, name='location_action'),
    path('location/<int:pk>/detail/',           views.location_detail_view, name='location_detail'),

    # ── Route avec paramètre slug — TOUJOURS EN DERNIER ───────────────────
    path('<slug:slug>/upload-reel/', views.property_upload_reel, name='upload_reel'),
    path('<slug:slug>/update/', views.property_update_view, name='update'),
    path('<slug:slug>/archive/', views.property_archive_view, name='archive'),
    path('<slug:slug>/tour-editor/', views.tour_editor_view, name='tour_editor'),
    path('<slug:slug>/tour/', views.tour_viewer_view, name='tour_viewer'),
    path('<slug:slug>/', views.property_detail_view, name='detail'),
]