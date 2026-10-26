from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .throttles import AuthRateThrottle


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = (AuthRateThrottle,)
    throttle_scope = 'auth'
from .views import (
    RegisterAPIView, ForgotPasswordAPIView, ResetPasswordVerifyAPIView, ResetPasswordConfirmAPIView,
    SocialSessionExchangeAPIView, SocialProviderStatusAPIView, SetRoleAPIView,
    UserProfileAPIView, BailleurProfileAPIView, BailleurDashboardAPIView, LocataireDashboardAPIView,
    SuperAdminDashboardAPIView, SuperAdminApproveDossierAPIView, SuperAdminDossierDocumentAPIView, SuperAdminRejectDossierAPIView,
    SuperAdminUserActionAPIView, SuperAdminCreateUserAPIView, SuperAdminThemeAPIView, SuperAdminThemeHistoryAPIView,
    SuperAdminThemeTestConnectionAPIView, SuperAdminBroadcastNotificationAPIView, PublicSiteConfigAPIView, ChatAssistantAPIView
)
from . import views
from . import pro_views

app_name = 'api_accounts'

urlpatterns = [
    path('login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterAPIView.as_view(), name='auth_register'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='auth_forgot_password'),
    path('reset-password/verify/', ResetPasswordVerifyAPIView.as_view(), name='auth_reset_password_verify'),
    path('reset-password/confirm/', ResetPasswordConfirmAPIView.as_view(), name='auth_reset_password_confirm'),
    path('social/status/', SocialProviderStatusAPIView.as_view(), name='auth_social_status'),
    path('social/exchange/', SocialSessionExchangeAPIView.as_view(), name='auth_social_exchange'),
    path('role/', SetRoleAPIView.as_view(), name='auth_set_role'),
    path('me/', UserProfileAPIView.as_view(), name='user_profile'),
    path('bailleur-profile/', BailleurProfileAPIView.as_view(), name='bailleur_profile'),
    path('bailleur/profile/', BailleurProfileAPIView.as_view(), name='bailleur_profile_nested'),
    path('bailleur-dashboard/', BailleurDashboardAPIView.as_view(), name='bailleur_dashboard'),
    path('bailleur/dashboard/', BailleurDashboardAPIView.as_view(), name='bailleur_dashboard_nested'),
    path('locataire-dashboard/', LocataireDashboardAPIView.as_view(), name='locataire_dashboard'),
    
    # ── Super-Admin Endpoints ──────────────────────────────────────────
    path('admin-dashboard/', SuperAdminDashboardAPIView.as_view(), name='superadmin_dashboard'),
    path('admin-dossier/<uuid:pk>/approve/', SuperAdminApproveDossierAPIView.as_view(), name='superadmin_approve_dossier'),
    path('admin-dossier/<uuid:pk>/documents/<str:field>/', SuperAdminDossierDocumentAPIView.as_view(), name='superadmin_dossier_document'),
    path('admin-dossier/<uuid:pk>/reject/', SuperAdminRejectDossierAPIView.as_view(), name='superadmin_reject_dossier'),
    path('admin-user/<uuid:pk>/action/', SuperAdminUserActionAPIView.as_view(), name='superadmin_user_action'),
    path('admin-user/create/', SuperAdminCreateUserAPIView.as_view(), name='superadmin_user_create'),
    path('admin-broadcast-notification/', SuperAdminBroadcastNotificationAPIView.as_view(), name='superadmin_broadcast_notification'),
    path('admin-theme/', SuperAdminThemeAPIView.as_view(), name='superadmin_theme'),
    path('admin-theme/history/', SuperAdminThemeHistoryAPIView.as_view(), name='superadmin_theme_history'),
    path('admin-theme/test-connection/', SuperAdminThemeTestConnectionAPIView.as_view(), name='superadmin_theme_test_connection'),
    path('site-config/', PublicSiteConfigAPIView.as_view(), name='public_site_config'),
    path('chat/assistant/', ChatAssistantAPIView.as_view(), name='chat_assistant'),

    # ── Professionnels, Artisans, Chantiers & Devis Réels (BDD) ───────────
    path('professionals/', pro_views.ProfessionalListAPIView.as_view(), name='pro_list'),
    path('professionals/me/', pro_views.ProfessionalMeProfileAPIView.as_view(), name='pro_me_profile'),
    path('professionals/projects/', pro_views.ProfessionalProjectListCreateAPIView.as_view(), name='pro_projects'),
    path('professionals/projects/<str:pk>/', pro_views.ProfessionalProjectDetailAPIView.as_view(), name='pro_project_detail'),
    path('professionals/projects/<str:pk>/like/', pro_views.ProfessionalProjectLikeAPIView.as_view(), name='pro_project_like'),
    path('professionals/quotes/', pro_views.ProfessionalQuoteListCreateAPIView.as_view(), name='pro_quotes'),
    path('professionals/quotes/<str:pk>/', pro_views.ProfessionalQuoteDetailAPIView.as_view(), name='pro_quote_detail'),
    path('professionals/<str:pk>/reviews/', pro_views.ProfessionalReviewListCreateAPIView.as_view(), name='pro_reviews'),
    path('professionals/<str:pk>/quotes/', pro_views.ProfessionalQuoteListCreateAPIView.as_view(), name='pro_create_quote'),
    path('professionals/<str:pk>/', pro_views.ProfessionalDetailAPIView.as_view(), name='pro_detail'),
    # ── Abonnements Locataire VIP & Recharges de Points ───────────────────
    path('subscriptions/current/', views.TenantSubscriptionCurrentAPIView.as_view(), name='tenant_subscription_current'),
    path('subscriptions/subscribe/', views.TenantSubscriptionSubscribeAPIView.as_view(), name='tenant_subscription_subscribe'),
    path('subscriptions/recharge-points/', views.TenantRechargePointsAPIView.as_view(), name='tenant_recharge_points'),
    path('subscriptions/deduct-points/', views.TenantDeductPointsAPIView.as_view(), name='tenant_deduct_points'),
    path('subscriptions/webhook/', views.TenantSubscriptionWebhookAPIView.as_view(), name='tenant_subscription_webhook'),
    # ── Recharges de Points Bailleur & Boosts ─────────────────────────────
    path('landlord/recharge-points/', views.LandlordRechargePointsAPIView.as_view(), name='landlord_recharge_points'),
]
