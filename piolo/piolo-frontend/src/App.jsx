// src/App.jsx — Routage principal de l'application Piolo React (Code-Splitting optimisé)
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import PrivateRoute from './components/PrivateRoute';
import RoleGuard from './components/RoleGuard';

// Pages critiques chargées immédiatement (Fast Initial Paint)
import HomePage from './pages/core/HomePage';
import LoginPage from './pages/auth/LoginPage';
import NotFound from './pages/NotFound';

// Pages publiques (Lazy Loaded)
const PropertyListPage  = lazy(() => import('./pages/properties/PropertyListPage'));
const PropertyDetail    = lazy(() => import('./pages/properties/PropertyDetail'));
const PropertyFormPage  = lazy(() => import('./pages/properties/PropertyFormPage'));
const SearchAlertsPage  = lazy(() => import('./pages/properties/SearchAlertsPage'));
const FavoritesListPage = lazy(() => import('./pages/properties/FavoritesListPage'));
const VisitsListPage    = lazy(() => import('./pages/properties/VisitsListPage'));
const LocationsListPage = lazy(() => import('./pages/properties/LocationsListPage'));
const InteractiveMapPage = lazy(() => import('./pages/properties/InteractiveMapPage'));
const ArchitectsPage    = lazy(() => import('./pages/properties/ArchitectsPage'));
const TourViewer        = lazy(() => import('./pages/properties/TourViewer'));
const TourEditor        = lazy(() => import('./pages/properties/TourEditor'));
const DiscoveryPage     = lazy(() => import('./pages/properties/DiscoveryPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Accounts, Dashboards & Heavy Modules (Lazy Loaded)
const LocataireDashboard     = lazy(() => import('./pages/locataire/Dashboard'));
const BailleurDashboard      = lazy(() => import('./pages/bailleur/Dashboard'));
const SuperAdminDashboard    = lazy(() => import('./pages/admin/SuperAdminDashboard'));
const ProfessionnelDashboard = lazy(() => import('./pages/pro/Dashboard'));
const ProfilePage            = lazy(() => import('./pages/accounts/ProfilePage'));
const SecurityPage           = lazy(() => import('./pages/accounts/SecurityPage'));
const SupportPage            = lazy(() => import('./pages/support/SupportPage'));
const CalendarPage           = lazy(() => import('./pages/calendar/CalendarPage'));
const VisitDetail            = lazy(() => import('./pages/properties/VisitDetail'));
const LocationDetail         = lazy(() => import('./pages/properties/LocationDetail'));
const ChatPage               = lazy(() => import('./pages/messaging/ChatPage'));
const NotificationPage       = lazy(() => import('./pages/notifications/NotificationPage'));

// Composants secondaires chargés à la demande
const PioloChatbot      = lazy(() => import('./components/PioloChatbot'));
const OnboardingManager = lazy(() => import('./components/OnboardingManager'));

/* ── Fallback élégant pour les transitions de routes ───────────── */
function RouteFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '38px',
        height: '38px',
        border: '3px solid rgba(212, 160, 23, 0.15)',
        borderTopColor: '#D4A017',
        borderRadius: '50%',
        animation: 'piolo-spin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      }} />
      <style>{`
        @keyframes piolo-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = {
    LOCATAIRE:     '/dashboard/locataire',
    BAILLEUR:      '/dashboard/bailleur',
    ARCHITECTE:    '/dashboard/pro',
    PROFESSIONNEL: '/dashboard/pro',
    ADMIN:         '/dashboard/admin',
  };
  return <Navigate to={routes[user.role] || '/properties'} replace />;
}

export default function App() {
  return (
    <SiteConfigProvider>
      <DarkModeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* ── Routes publiques ────────────────────────────────── */}
                <Route path="/"               element={<HomePage />} />
                <Route path="/login"          element={<LoginPage />} />
                <Route path="/register"       element={<LoginPage />} />
                <Route path="/inscription"    element={<LoginPage />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                <Route path="/reset-password" element={<LoginPage />} />
                <Route path="/properties"     element={<PropertyListPage />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/properties/:id/tour" element={<TourViewer />} />
                <Route path="/discovery"      element={<DiscoveryPage />} />
                <Route path="/decouverte"      element={<DiscoveryPage />} />
                <Route path="/map"            element={<InteractiveMapPage />} />
                <Route path="/interactive-map" element={<InteractiveMapPage />} />
                <Route path="/architectes"    element={<ArchitectsPage />} />
                <Route path="/unauthorized"   element={<NotFound message="Accès refusé." />} />

                {/* ── Routes privées ──────────────────────────────────── */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<RoleRedirect />} />
                  
                  <Route element={<RoleGuard allowedRoles={['BAILLEUR', 'ADMIN']} />}>
                    <Route path="/properties/create" element={<PropertyFormPage />} />
                    <Route path="/properties/new" element={<PropertyFormPage />} />
                    <Route path="/properties/update/:id" element={<PropertyFormPage />} />
                    <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
                    <Route path="/properties/:id/update" element={<PropertyFormPage />} />
                    <Route path="/properties/:id/tour-editor" element={<TourEditor />} />
                  </Route>

                  <Route path="/messages" element={<ChatPage />} />
                  <Route path="/messages/:id" element={<ChatPage />} />

                  {/* Favoris, Visites, Alertes & Profil (avec alias pour compatibilité) */}
                  <Route path="/dashboard/locataire/favoris" element={<FavoritesListPage />} />
                  <Route path="/dashboard/bailleur/favoris"  element={<FavoritesListPage />} />
                  <Route path="/favorites"                   element={<FavoritesListPage />} />
                  <Route path="/favoris"                     element={<FavoritesListPage />} />

                  <Route path="/dashboard/locataire/visites" element={<VisitsListPage />} />
                  <Route path="/dashboard/bailleur/visites"  element={<VisitsListPage />} />
                  <Route path="/visites"                     element={<VisitsListPage />} />
                  <Route path="/visits"                      element={<VisitsListPage />} />
                  <Route path="/visites/:id"                 element={<VisitDetail />} />
                  <Route path="/visits/:id"                  element={<VisitDetail />} />
                  <Route path="/dashboard/locataire/visites/:id" element={<VisitDetail />} />
                  <Route path="/dashboard/bailleur/visites/:id"  element={<VisitDetail />} />
                  <Route path="/dashboard/locataire/locations" element={<LocationsListPage />} />
                  <Route path="/dashboard/bailleur/locations"  element={<LocationsListPage />} />
                  <Route path="/locations"                    element={<LocationsListPage />} />
                  <Route path="/locations/:id"                 element={<LocationDetail />} />
                  <Route path="/dashboard/locataire/locations/:id" element={<LocationDetail />} />
                  <Route path="/dashboard/bailleur/locations/:id"  element={<LocationDetail />} />

                  <Route path="/dashboard/locataire/alertes" element={<SearchAlertsPage />} />
                  <Route path="/dashboard/bailleur/alertes"  element={<SearchAlertsPage />} />
                  <Route path="/alertes"                     element={<SearchAlertsPage />} />
                  <Route path="/alerts"                      element={<SearchAlertsPage />} />

                  <Route path="/dashboard/locataire/profil"  element={<ProfilePage />} />
                  <Route path="/dashboard/bailleur/profil"   element={<ProfilePage />} />
                  <Route path="/profil"                      element={<ProfilePage />} />
                  <Route path="/profile"                     element={<ProfilePage />} />

                  <Route path="/securite"                    element={<SecurityPage />} />
                  <Route path="/security"                    element={<SecurityPage />} />
                  <Route path="/privacy"                     element={<SecurityPage />} />
                  <Route path="/terms"                       element={<SecurityPage />} />

                  <Route path="/support"                     element={<SupportPage />} />
                  <Route path="/help"                        element={<SupportPage />} />

                  <Route path="/calendrier"                  element={<CalendarPage />} />
                  <Route path="/calendar"                    element={<CalendarPage />} />
                  <Route path="/notifications"                element={<NotificationPage />} />

                  {/* Dashboards */}
                  <Route path="/dashboard/locataire/*"       element={<LocataireDashboard />} />
                  <Route path="/dashboard/bailleur/*"        element={<BailleurDashboard />} />
                  <Route path="/dashboard/pro/*"             element={<ProfessionnelDashboard />} />
                  <Route path="/dashboard/professionnel/*"   element={<ProfessionnelDashboard />} />
                  <Route path="/dashboard/architecte/*"      element={<ProfessionnelDashboard />} />
                  <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                    <Route path="/dashboard/admin/*"           element={<SuperAdminDashboard />} />
                    <Route path="/admin/dashboard/*"             element={<SuperAdminDashboard />} />
                  </Route>
                </Route>

                {/* ── 404 ─────────────────────────────────────────────── */}
                <Route path="*"   element={<NotFound />} />
              </Routes>
            </Suspense>

            <Suspense fallback={null}>
              <PioloChatbot />
              <OnboardingManager />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </DarkModeProvider>
    </SiteConfigProvider>
  );
}
