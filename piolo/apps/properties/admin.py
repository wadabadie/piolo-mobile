from django.contrib import admin
from django.utils import timezone

from .models import (
    LocationRequest, PanoramaHotspot, PanoramaScene, Property, PropertyStatus,
    VisitRequest, VirtualTour, PropertyBoost, SearchAlert,
)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'city', 'property_type', 'transaction_type', 'status', 'is_published', 'created_at')
    list_filter = ('status', 'is_published', 'property_type', 'transaction_type', 'city')
    search_fields = ('title', 'city', 'neighborhood', 'owner__email')
    readonly_fields = ('slug', 'created_at', 'updated_at', 'published_at', 'views_count', 'favorites_count')
    actions = ('publish_selected', 'archive_selected')

    @admin.action(description='Publier les annonces sélectionnées (avec alertes locataires)')
    def publish_selected(self, request, queryset):
        from apps.notifications.email_service import notify_matching_search_alerts
        count = 0
        for prop in queryset:
            prop.status = PropertyStatus.PUBLISHED
            prop.is_published = True
            prop.published_at = timezone.now()
            prop.save(update_fields=['status', 'is_published', 'published_at'])
            try:
                notify_matching_search_alerts(prop)
            except Exception:
                pass
            count += 1
        self.message_user(request, f'{count} annonce(s) publiée(s) et alertes de recherche transmises.')

    @admin.action(description='Archiver les annonces sélectionnées')
    def archive_selected(self, request, queryset):
        count = queryset.update(status=PropertyStatus.ARCHIVED, is_published=False)
        self.message_user(request, f'{count} annonce(s) archivée(s).')



@admin.register(VisitRequest)
class VisitRequestAdmin(admin.ModelAdmin):
    list_display = ('property', 'tenant', 'status', 'requested_date', 'requested_time', 'created_at')
    list_filter = ('status', 'requested_date')
    search_fields = ('property__title', 'tenant__email', 'tenant__first_name', 'tenant__last_name')
    readonly_fields = ('created_at', 'updated_at')
    actions = ('confirm_selected_visits', 'refuse_selected_visits', 'cancel_selected_visits')

    @admin.action(description='Confirmer les demandes de visite sélectionnées')
    def confirm_selected_visits(self, request, queryset):
        from apps.notifications.email_service import send_visit_status_email
        count = 0
        for visit in queryset:
            visit.status = VisitRequest.Status.CONFIRMED
            visit.confirmed_date = visit.confirmed_date or visit.requested_date
            visit.confirmed_time = visit.confirmed_time or visit.requested_time
            visit.save(update_fields=['status', 'confirmed_date', 'confirmed_time', 'updated_at'])
            send_visit_status_email(visit, confirmed=True)
            count += 1
        self.message_user(request, f'{count} visite(s) confirmée(s) et email(s) envoyé(s).')

    @admin.action(description='Refuser les demandes de visite sélectionnées')
    def refuse_selected_visits(self, request, queryset):
        from apps.notifications.email_service import send_visit_status_email
        count = 0
        for visit in queryset:
            visit.status = VisitRequest.Status.REFUSED
            visit.save(update_fields=['status', 'updated_at'])
            send_visit_status_email(visit, confirmed=False)
            count += 1
        self.message_user(request, f'{count} visite(s) refusée(s) et email(s) envoyé(s).')

    @admin.action(description='Annuler les demandes de visite sélectionnées')
    def cancel_selected_visits(self, request, queryset):
        from apps.notifications.email_service import send_visit_cancelled_email
        count = 0
        for visit in queryset:
            visit.status = VisitRequest.Status.CANCELLED
            visit.save(update_fields=['status', 'updated_at'])
            send_visit_cancelled_email(visit)
            count += 1
        self.message_user(request, f'{count} visite(s) annulée(s) et notification(s) envoyée(s).')


@admin.register(LocationRequest)
class LocationRequestAdmin(admin.ModelAdmin):
    list_display = ('property', 'tenant', 'status', 'move_in_date', 'profession', 'monthly_income', 'has_guarantor', 'created_at')
    list_filter = ('status', 'move_in_date', 'has_guarantor')
    search_fields = ('property__title', 'tenant__email', 'tenant__first_name', 'tenant__last_name', 'profession', 'employer')
    readonly_fields = ('created_at', 'updated_at')
    actions = ('accept_selected_locations', 'review_selected_locations', 'refuse_selected_locations', 'cancel_selected_locations')

    @admin.action(description='Accepter les dossiers de location sélectionnés')
    def accept_selected_locations(self, request, queryset):
        from apps.notifications.email_service import send_location_status_email
        count = 0
        for loc in queryset:
            loc.status = LocationRequest.Status.ACCEPTED
            loc.save(update_fields=['status', 'updated_at'])
            send_location_status_email(loc, 'accepted')
            count += 1
        self.message_user(request, f'{count} dossier(s) accepté(s) et email(s) envoyé(s).')

    @admin.action(description='Passer les dossiers en cours d\'examen')
    def review_selected_locations(self, request, queryset):
        from apps.notifications.email_service import send_location_status_email
        count = 0
        for loc in queryset:
            loc.status = LocationRequest.Status.REVIEWING
            loc.save(update_fields=['status', 'updated_at'])
            send_location_status_email(loc, 'reviewing')
            count += 1
        self.message_user(request, f'{count} dossier(s) en examen et email(s) envoyé(s).')

    @admin.action(description='Refuser les dossiers de location sélectionnés')
    def refuse_selected_locations(self, request, queryset):
        from apps.notifications.email_service import send_location_status_email
        count = 0
        for loc in queryset:
            loc.status = LocationRequest.Status.REFUSED
            loc.save(update_fields=['status', 'updated_at'])
            send_location_status_email(loc, 'refused')
            count += 1
        self.message_user(request, f'{count} dossier(s) refusé(s) et email(s) envoyé(s).')

    @admin.action(description='Annuler les dossiers de location sélectionnés')
    def cancel_selected_locations(self, request, queryset):
        from apps.notifications.email_service import send_location_cancelled_email
        count = 0
        for loc in queryset:
            loc.status = LocationRequest.Status.CANCELLED
            loc.save(update_fields=['status', 'updated_at'])
            send_location_cancelled_email(loc)
            count += 1
        self.message_user(request, f'{count} dossier(s) annulé(s) et notification(s) envoyée(s).')


@admin.register(VirtualTour)
class VirtualTourAdmin(admin.ModelAdmin):
    list_display = ('property', 'name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('property__title', 'property__owner__email')
    readonly_fields = ('created_at',)


@admin.register(PanoramaScene)
class PanoramaSceneAdmin(admin.ModelAdmin):
    list_display = ('name', 'tour', 'order')
    list_filter = ('tour',)
    search_fields = ('name', 'tour__property__title')


@admin.register(PanoramaHotspot)
class PanoramaHotspotAdmin(admin.ModelAdmin):
    list_display = ('scene', 'target_scene', 'hotspot_type', 'label', 'pitch', 'yaw')
    list_filter = ('hotspot_type',)
    search_fields = ('scene__name', 'target_scene__name', 'label')


@admin.register(PropertyBoost)
class PropertyBoostAdmin(admin.ModelAdmin):
    list_display = (
        'get_property_title', 'boost_type', 'owner', 'is_active',
        'get_is_valid', 'activated_at', 'expires_at', 'points_spent', 'boosted_views'
    )
    list_filter = ('boost_type', 'is_active', 'activated_at')
    search_fields = ('property__title', 'owner__email')
    readonly_fields = ('activated_at', 'boosted_views')
    actions = ('expire_selected_boosts',)

    @admin.display(description='Annonce', ordering='property__title')
    def get_property_title(self, obj):
        return obj.property.title

    @admin.display(description='Valide ?', boolean=True)
    def get_is_valid(self, obj):
        return obj.is_boost_valid()

    @admin.action(description='Expirer les boosts sélectionnés')
    def expire_selected_boosts(self, request, queryset):
        from .models import _sync_property_boost
        count = 0
        for boost in queryset.filter(is_active=True):
            boost.is_active = False
            boost.save(update_fields=['is_active'])
            _sync_property_boost(boost.property)
            count += 1
        self.message_user(request, f'{count} boost(s) expiré(s).')


@admin.register(SearchAlert)
class SearchAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'city', 'neighborhood', 'property_type', 'min_price', 'max_price', 'is_active', 'last_notified', 'created_at')
    list_filter = ('is_active', 'city', 'property_type')
    search_fields = ('title', 'user__email', 'city', 'neighborhood')
    ordering = ('-created_at',)

