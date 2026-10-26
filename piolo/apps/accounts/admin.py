# apps/accounts/admin.py
"""
Administration Django pour Piolo — gestion des utilisateurs et dossiers KYC.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.utils import timezone

from .models import (
    AccountStatus, AuditLog, BailleurDossier, CustomUser, DossierStatus, PointTransaction,
    ProfessionalProfile, ProfessionalProject, ProfessionalReview, ProfessionalQuoteRequest
)


# ─── UTILISATEURS ─────────────────────────────────────────────────────────────

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Administration des utilisateurs Piolo."""

    list_display  = ['email', 'get_full_name', 'role', 'status_badge', 'points', 'verification_level', 'date_joined']
    list_filter   = ['role', 'status', 'verification_level', 'is_active', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering      = ['-date_joined']

    # Champs à afficher dans le formulaire d'édition
    fieldsets = (
        ("Identité", {
            'fields': ('email', 'first_name', 'last_name', 'phone', 'phone_verified', 'avatar', 'city'),
        }),
        ("Rôle & Statut", {
            'fields': ('role', 'status', 'is_active', 'verification_level', 'points'),
        }),
        ("Permissions", {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        ("Dates", {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',),
        }),
    )

    # Champs pour la création d'un utilisateur depuis l'admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['date_joined', 'last_login', 'points']

    # Remplace le champ 'username' par 'email' (AbstractBaseUser)
    ordering = ['-date_joined']

    @admin.display(description="Statut", ordering='status')
    def status_badge(self, obj):
        colors = {
            AccountStatus.ACTIVE:    '#1E7A47',
            AccountStatus.PENDING:   '#A8891C',
            AccountStatus.SUSPENDED: '#B83232',
            AccountStatus.BLOCKED:   '#333',
        }
        color = colors.get(obj.status, '#666')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">{}</span>',
            color,
            obj.get_status_display(),
        )


# ─── DOSSIERS KYC ─────────────────────────────────────────────────────────────

class BailleurDossierInline(admin.StackedInline):
    model  = BailleurDossier
    extra  = 0
    fields = ['status', 'rejection_reason', 'rejection_count', 'reviewed_at']
    readonly_fields = ['submitted_at', 'reviewed_at', 'rejection_count']


@admin.register(BailleurDossier)
class BailleurDossierAdmin(admin.ModelAdmin):
    """Administration des dossiers KYC bailleurs avec actions d'approbation/rejet."""

    list_display  = ['user', 'status_badge', 'city', 'property_count', 'rejection_count', 'submitted_at', 'reviewed_at']
    list_filter   = ['status', 'document_type', 'submitted_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'document_number', 'city']
    ordering      = ['-submitted_at']
    readonly_fields = ['submitted_at', 'reviewed_by', 'reviewed_at', 'rejection_count']

    fieldsets = (
        ("Utilisateur", {
            'fields': ('user',),
        }),
        ("Identité", {
            'fields': ('document_type', 'document_number', 'cni_recto', 'cni_verso', 'selfie'),
        }),
        ("Patrimoine", {
            'fields': ('city', 'neighborhoods', 'property_count', 'property_types', 'description'),
        }),
        ("Décision", {
            'fields': ('status', 'rejection_reason', 'rejection_count', 'reviewed_by', 'reviewed_at'),
        }),
        ("Dates", {
            'fields': ('submitted_at',),
            'classes': ('collapse',),
        }),
    )

    actions = ['action_approve', 'action_reject_fraud']

    @admin.display(description="Statut", ordering='status')
    def status_badge(self, obj):
        colors = {
            DossierStatus.PENDING:  '#A8891C',
            DossierStatus.APPROVED: '#1E7A47',
            DossierStatus.REJECTED: '#B83232',
            DossierStatus.SUSPENDED:'#666',
        }
        color = colors.get(obj.status, '#666')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">{}</span>',
            color,
            obj.get_status_display(),
        )

    @admin.action(description="✅ Approuver les dossiers sélectionnés")
    def action_approve(self, request, queryset):
        approved = 0
        for dossier in queryset.filter(status=DossierStatus.PENDING):
            dossier.approve(request.user)
            AuditLog.objects.create(user=request.user, email=dossier.user.email, action='DOSSIER_APPROVED_BULK', details=f'Dossier bailleur approuvé depuis Django Admin : {dossier.pk}', ip_address=request.META.get('REMOTE_ADDR', ''), user_agent=request.META.get('HTTP_USER_AGENT', ''))
            approved += 1
        self.message_user(request, f"{approved} dossier(s) approuvé(s) avec succès.")

    @admin.action(description="❌ Rejeter pour fraude documentaire")
    def action_reject_fraud(self, request, queryset):
        rejected = 0
        for dossier in queryset.filter(status=DossierStatus.PENDING):
            dossier.reject(request.user, reason="Documents frauduleux ou non conformes.")
            AuditLog.objects.create(user=request.user, email=dossier.user.email, action='DOSSIER_REJECTED_BULK', details=f'Dossier bailleur rejeté depuis Django Admin : {dossier.pk}', ip_address=request.META.get('REMOTE_ADDR', ''), user_agent=request.META.get('HTTP_USER_AGENT', ''))
            rejected += 1
        self.message_user(request, f"{rejected} dossier(s) rejeté(s).")


# ─── TRANSACTIONS DE POINTS ───────────────────────────────────────────────────

@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display  = ['user', 'delta_display', 'balance_after', 'reason', 'created_at']
    list_filter   = ['created_at']
    search_fields = ['user__email', 'reason']
    ordering      = ['-created_at']
    readonly_fields = ['user', 'delta', 'balance_after', 'reason', 'created_at']

    def has_add_permission(self, request):
        return False   # Les transactions ne se créent que via award/deduct_points

    def has_change_permission(self, request, obj=None):
        return False   # Journal immuable

    @admin.display(description="Variation")
    def delta_display(self, obj):
        color = '#1E7A47' if obj.delta > 0 else '#B83232'
        sign  = '+' if obj.delta > 0 else ''
        return format_html(
            '<strong style="color:{};">{}{} pts</strong>',
            color, sign, obj.delta,
        )


# ─── PROFESSIONNELS & DEVIS (MODULE 5) ───────────────────────────────────────

@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'primary_trade', 'city', 'phone', 'is_verified', 'rating', 'created_at']
    list_filter = ['is_verified', 'primary_trade', 'city']
    search_fields = ['business_name', 'primary_trade', 'city', 'phone', 'email', 'user__email']
    ordering = ['-created_at']


@admin.register(ProfessionalProject)
class ProfessionalProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'professional', 'category', 'city', 'budget', 'duration', 'likes_count', 'created_at']
    list_filter = ['category', 'city']
    search_fields = ['title', 'professional__business_name', 'city', 'description']
    ordering = ['-created_at']



@admin.register(ProfessionalReview)
class ProfessionalReviewAdmin(admin.ModelAdmin):
    list_display = ['professional', 'author_name', 'rating', 'author_role', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['professional__business_name', 'author_name', 'comment']
    ordering = ['-created_at']


@admin.register(ProfessionalQuoteRequest)
class ProfessionalQuoteRequestAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'project_type', 'professional', 'city', 'budget_estimate', 'status_badge', 'created_at']
    list_filter = ['status', 'city', 'created_at']
    search_fields = ['client_name', 'client_phone', 'client_email', 'project_type', 'professional__business_name', 'city']
    ordering = ['-created_at']
    actions = ['action_mark_accepted', 'action_mark_completed', 'action_mark_refused']

    @admin.display(description="Statut", ordering='status')
    def status_badge(self, obj):
        colors = {
            'PENDING': '#D97706',
            'ACCEPTED': '#16A34A',
            'REFUSED': '#DC2626',
            'COMPLETED': '#2563EB',
        }
        color = colors.get(obj.status, '#666')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;">{}</span>',
            color,
            obj.get_status_display(),
        )

    @admin.action(description="✅ Marquer comme Accepté (avec email au client)")
    def action_mark_accepted(self, request, queryset):
        count = 0
        from apps.notifications.email_service import send_pro_quote_status_email
        from apps.notifications.whatsapp_service import send_pro_quote_status_whatsapp
        for quote in queryset:
            quote.status = 'ACCEPTED'
            quote.save(update_fields=['status'])
            try:
                send_pro_quote_status_email(quote, status='ACCEPTED')
            except Exception:
                pass
            try:
                send_pro_quote_status_whatsapp(quote, status='ACCEPTED')
            except Exception:
                pass
            count += 1
        self.message_user(request, f"{count} devis marqué(s) comme Accepté(s).")

    @admin.action(description="🏆 Marquer comme Terminé (avec email avis au client)")
    def action_mark_completed(self, request, queryset):
        count = 0
        from apps.notifications.email_service import send_pro_quote_status_email
        from apps.notifications.whatsapp_service import send_pro_quote_status_whatsapp
        for quote in queryset:
            quote.status = 'COMPLETED'
            quote.save(update_fields=['status'])
            try:
                send_pro_quote_status_email(quote, status='COMPLETED')
            except Exception:
                pass
            try:
                send_pro_quote_status_whatsapp(quote, status='COMPLETED')
            except Exception:
                pass
            count += 1
        self.message_user(request, f"{count} devis marqué(s) comme Terminé(s).")

    @admin.action(description="❌ Marquer comme Refusé (avec email au client)")
    def action_mark_refused(self, request, queryset):
        count = 0
        from apps.notifications.email_service import send_pro_quote_status_email
        from apps.notifications.whatsapp_service import send_pro_quote_status_whatsapp
        for quote in queryset:
            quote.status = 'REFUSED'
            quote.save(update_fields=['status'])
            try:
                send_pro_quote_status_email(quote, status='REFUSED')
            except Exception:
                pass
            try:
                send_pro_quote_status_whatsapp(quote, status='REFUSED')
            except Exception:
                pass
            count += 1
        self.message_user(request, f"{count} devis marqué(s) comme Refusé(s).")

