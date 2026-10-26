# apps/properties/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet,
    VisitDetailAPIView,
    LocationDetailAPIView,
    LocationDocumentAPIView,
    VisitRequestsListAPIView,
    LocationRequestsListAPIView,
    BookingRequestsListAPIView,
    BookingDetailAPIView,
    RentEstimateAPIView,
    PropertyBoostAPIView,
    PropertyBoostStatusAPIView,
    PropertyBoostListAPIView,
    ConciergeMandateListCreateAPIView,
    ConciergeMandateDetailAPIView,
)

# Le router génère automatiquement toutes les routes CRUD + les actions custom
router = DefaultRouter()
router.register(r'', PropertyViewSet, basename='property')

app_name = 'api_properties'

urlpatterns = [
    path('estimate-rent/', RentEstimateAPIView.as_view(), name='api_rent_estimate'),
    path('requests/visits/', VisitRequestsListAPIView.as_view(), name='api_visit_requests_list'),
    path('requests/locations/', LocationRequestsListAPIView.as_view(), name='api_location_requests_list'),
    path('requests/bookings/', BookingRequestsListAPIView.as_view(), name='api_booking_requests_list'),
    path('visits/<int:pk>/', VisitDetailAPIView.as_view(), name='api_visit_detail'),
    path('locations/<int:pk>/', LocationDetailAPIView.as_view(), name='api_location_detail'),
    path('bookings/<int:pk>/', BookingDetailAPIView.as_view(), name='api_booking_detail'),
    path('locations/<int:pk>/documents/<str:field>/', LocationDocumentAPIView.as_view(), name='api_location_document'),
    # ── Boost d'annonces ──────────────────────────────────────────────────────
    path('boost/<uuid:property_id>/', PropertyBoostAPIView.as_view(), name='api_property_boost'),
    path('boost/<uuid:property_id>/status/', PropertyBoostStatusAPIView.as_view(), name='api_property_boost_status'),
    path('my-boosts/', PropertyBoostListAPIView.as_view(), name='api_my_boosts'),
    # ── Mandats Conciergerie & Gestion Déléguée ───────────────────────────────
    path('concierge-mandates/', ConciergeMandateListCreateAPIView.as_view(), name='api_concierge_mandates_list_create'),
    path('concierge-mandates/<str:pk>/', ConciergeMandateDetailAPIView.as_view(), name='api_concierge_mandate_detail'),
    path('', include(router.urls)),
]
