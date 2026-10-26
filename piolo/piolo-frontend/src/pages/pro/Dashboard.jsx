import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import MobileBottomNav from '../../components/MobileBottomNav';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import ProAddProjectModal from '../../components/ProAddProjectModal';
import ProProjectDetailModal from '../../components/ProProjectDetailModal';
import ProQuoteDetailModal from '../../components/ProQuoteDetailModal';
import ProSubscriptionModal from '../../components/ProSubscriptionModal';
import ProPublishConfirmModal from '../../components/ProPublishConfirmModal';
import ProDeleteConfirmModal from '../../components/ProDeleteConfirmModal';
import ProLocationPickerMap, { CAMEROON_LOCATIONS } from '../../components/ProLocationPickerMap';
import ProDiscoveryVideoModal from '../../components/ProDiscoveryVideoModal';
import { cacheManager } from '../../services/cacheManager';
import { professionalsApi } from '../../services/api';
import { proProjectsService } from '../../services/proProjects';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../utils/media';
import '../bailleur/dashboard.css';

// SVG Icons haute fidélité
const Icons = {
  Tools: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
    </svg>
  ),
  Camera: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  Chart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
    </svg>
  ),
  CheckBadge: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2ECC71">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  ),
  Location: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#888">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  ),
  Heart: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
    </svg>
  ),
  Message: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.047 15.047 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.5-.4-.9-.9-.9H4.11c-.5 0-.9.4-.9.9 0 9.39 7.63 17.02 17.02 17.02.5 0 .9-.4.9-.9v-3.56c0-.5-.4-.9-.9-.9-.22-.08-.22-.08-.22-.08z"/>
    </svg>
  )
};

/* ─── Skeleton Loading Components pour Dashboard Pro ─── */
const SkeletonProjectCard = () => (
  <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E3DA', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 200, width: '100%', background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '75%', height: 20, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '100%', height: 36, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #F0ECE4' }}>
        <div style={{ width: 110, height: 28, borderRadius: 8, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  </div>
);

const SkeletonQuoteCard = () => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderRadius: 14, background: '#FAF9F6', border: '1px solid #E8E3DA' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 140, height: 20, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: 70, height: 18, borderRadius: 10, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: 80, height: 16, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <div style={{ width: '70%', height: 16, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 120, height: 38, borderRadius: 10, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: 160, height: 38, borderRadius: 10, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </div>
  </div>
);

// Liste des métiers de l'habitat & mobilier
export const PRO_CATEGORIES = [
  {
    id: 'mobilier',
    name: 'Menuiserie, Mobilier & Déco',
    trades: [
      'Menuisier & Ébéniste (Meubles sur-mesure)',
      "Architecte d'Intérieur & Designer d'Espace",
      'Tapissier & Rénovation Canapés',
      'Cuisiniste & Dressings',
      'Peintre & Décorateur / Staffeur',
      'Ferronnier d’Art & Métallerie',
      'Menuiserie Aluminium & Vitrerie',
      'Carreleur & Pose de Parquet',
    ]
  },
  {
    id: 'depannage',
    name: 'Plomberie, Électricité & Énergie',
    trades: [
      'Plombier & Installations Sanitaires',
      'Électricien Bâtiment & Domotique',
      'Frigoriste & Climatisation',
      'Énergie Solaire & Panneaux Photovoltaïques',
      'Serrurier & Sécurité Portes',
      'Forage & Traitement d’Eau',
    ]
  },
  {
    id: 'architecture_btp',
    name: 'Architecture, Ingénierie & BTP',
    trades: [
      'Architecte DPLG / Concepteur',
      'Ingénieur BTP & Calcul de Structure',
      'Dessinateur Projeteur / Plans 3D',
      'Topographe & Géomètre',
      'Entrepreneur BTP & Gros Œuvre',
      'Maître d’Œuvre & Suivi de Chantier',
    ]
  },
  {
    id: 'exterieur',
    name: 'Extérieur, Jardin & Sécurité',
    trades: [
      'Paysagiste & Jardinier',
      'Installateur Caméras & Clôtures Électriques',
      'Piscines & Bassins',
      'Désinsectisation & Entretien Extérieur',
    ]
  }
];

export default function ProfessionnelDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const cachedPro = cacheManager.get('pro_dashboard_data');

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'portfolio');
  const [loading, setLoading] = useState(() => !cachedPro);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [proProfile, setProProfile] = useState(() => cachedPro?.profile || {
    business_name: '',
    primary_trade: '',
    secondary_trades: [],
    city: 'Yaoundé',
    neighborhoods: '',
    latitude: 3.8480,
    longitude: 11.5021,
    experience_years: '',
    phone: '',
    whatsapp: '',
    bio: '',
    pricing_indicative: 'Sur devis',
    rating: 5.0,
    reviews_count: 0
  });

  const [projects, setProjects] = useState(() => cachedPro?.projects || []);
  const [quotes, setQuotes] = useState(() => cachedPro?.quotes || []);
  const [showAddProject, setShowAddProject] = useState(false);
  const [points, setPoints] = useState(user?.points || 50);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  const [pendingPublishProject, setPendingPublishProject] = useState(null);
  const [pendingDeleteProject, setPendingDeleteProject] = useState(null);
  const [selectedQuoteModal, setSelectedQuoteModal] = useState(null);
  const [discoveryVideoOpen, setDiscoveryVideoOpen] = useState(false);
  const [isPublishingProject, setIsPublishingProject] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchProData = async () => {
    try {
      const existing = cacheManager.get('pro_dashboard_data');
      if (!existing) setLoading(true);

      const [profileRes, quotesRes] = await Promise.all([
        professionalsApi.me(),
        professionalsApi.quotes().catch(() => ({ data: [] }))
      ]);

      if (profileRes.data) {
        setProProfile(profileRes.data);
        setProjects(profileRes.data.projects || []);
      }
      if (quotesRes.data) {
        setQuotes(quotesRes.data);
      }

      cacheManager.set('pro_dashboard_data', {
        profile: profileRes.data,
        projects: profileRes.data?.projects || [],
        quotes: quotesRes.data || []
      }, 180000);
    } catch (err) {
      console.error('Erreur chargement profil pro BDD:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProData();
  }, []);

  const handleOpenAddProject = () => {
    const hasVip = activePlan !== null;
    if (!hasVip && points < 5) {
      setSubscriptionModalOpen(true);
      return;
    }
    setShowAddProject(true);
  };

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
    if (searchParams.get('action') === 'new_project') {
      handleOpenAddProject();
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handlePreSaveProject = (newP) => {
    setShowAddProject(false);
    setPendingPublishProject(newP);
  };

  const handleConfirmPublish = async () => {
    if (!pendingPublishProject || isPublishingProject) return;
    try {
      setIsPublishingProject(true);
      const payload = {
        title: pendingPublishProject.title,
        category: pendingPublishProject.category || proProfile?.primary_trade || 'Menuiserie & Mobilier sur-mesure',
        city: pendingPublishProject.city || proProfile?.city || 'Yaoundé',
        duration: pendingPublishProject.duration || '2 semaines',
        budget: pendingPublishProject.budget || '',
        description: pendingPublishProject.description || '',
        image: pendingPublishProject.image || pendingPublishProject.afterImage || '',
        beforeImage: pendingPublishProject.beforeImage || '',
        gallery_images: pendingPublishProject.gallery_images || pendingPublishProject.galleryImages || pendingPublishProject.gallery?.map(g => typeof g === 'string' ? g : g.url) || [],
        videos: pendingPublishProject.videos || [],
        materials: pendingPublishProject.materials || []
      };

      const res = await professionalsApi.createProject(payload);
      if (res.data?.user_points !== undefined) {
        setPoints(res.data.user_points);
      }
      
      setPendingPublishProject(null);
      setIsPublishingProject(false);
      
      setToastMessage('✓ Réalisation enregistrée et publiée avec succès sur toute la plateforme !');
      setTimeout(() => setToastMessage(''), 4500);

      await fetchProData();
    } catch (err) {
      console.error('Erreur publication projet:', err);
      setIsPublishingProject(false);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Erreur lors de la publication.";
      setToastMessage(`❌ ${errMsg}`);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const payload = {
        ...proProfile,
        latitude: parseFloat(proProfile.latitude) || 3.8480,
        longitude: parseFloat(proProfile.longitude) || 11.5021
      };
      const res = await professionalsApi.updateProfile(payload);
      if (res.data) {
        setProProfile(prev => ({
          ...prev,
          ...res.data,
          latitude: parseFloat(res.data.latitude) || payload.latitude,
          longitude: parseFloat(res.data.longitude) || payload.longitude
        }));
      }
      setIsSavingProfile(false);
      setToastMessage('✓ Emplacement Google Maps et profil enregistrés avec succès !');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error('Erreur enregistrement profil:', err);
      setIsSavingProfile(false);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Erreur lors de l'enregistrement du profil.";
      setToastMessage(`❌ ${errMsg}`);
      setTimeout(() => setToastMessage(''), 4500);
    }
  };

  const handleRequestDeleteProject = (proj) => {
    setPendingDeleteProject(proj);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteProject) return;
    try {
      await professionalsApi.deleteProject(pendingDeleteProject.id);
      setProjects(prev => prev.filter(p => p.id !== pendingDeleteProject.id));
      setPendingDeleteProject(null);
      setToastMessage('✓ Réalisation supprimée avec succès !');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setPendingDeleteProject(null);
      setToastMessage('❌ Erreur lors de la suppression.');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main pro-dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F6F0' }}>
        <style>{`
          .pro-dash-topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #FFFFFF;
            padding: 16px 28px;
            border-bottom: 1px solid #E8E3DA;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            flex-wrap: wrap;
            gap: 12px;
            flex-shrink: 0;
          }
          .pro-dash-top-brand {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .pro-dash-switch-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 11.5px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .pro-dash-top-badges {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .pro-dash-badge-item {
            background: #FAF9F6;
            border: 1.5px solid #E8E3DA;
            padding: 6px 14px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 700;
            color: #0F0D09;
          }
          .pro-dash-badge-item .val { font-weight: 800; }
          .pro-dash-badge-item .lbl { font-weight: 500; color: #777; font-size: 11px; }
          .pro-dash-pts-badge {
            cursor: pointer;
            border-color: #D4AF37;
            background: rgba(212,175,55,0.08);
          }
          .pro-dash-pts-badge .action-tag {
            font-size: 10px;
            background: #0F0D09;
            color: #F6D365;
            padding: 2px 6px;
            border-radius: 6px;
            font-weight: 700;
            margin-left: 2px;
          }

          /* HERO PRO CARD */
          .pro-dash-hero {
            background: linear-gradient(145deg, #16130E 0%, #0C0A07 100%);
            border-radius: 20px;
            padding: 24px 28px;
            color: #FFFFFF;
            margin-bottom: 22px;
            position: relative;
            border: 1px solid rgba(212,175,55,0.25);
            box-shadow: 0 10px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
          }
          .pro-dash-hero-inner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 18px;
          }
          .pro-dash-cert-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(212,175,55,0.12);
            border: 1px solid rgba(212,175,55,0.35);
            padding: 3px 10px;
            border-radius: 16px;
            color: #F6D365;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .pro-dash-cert-pill .sep { opacity: 0.5; }
          .pro-dash-cert-pill .rating { display: inline-flex; align-items: center; gap: 3px; }
          .pro-dash-cert-pill .reviews-count { color: rgba(255,255,255,0.65); font-size: 10.5px; font-weight: 500; }
          .pro-dash-name {
            font-family: 'Poppins', sans-serif;
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 4px;
            color: #FFF;
            letter-spacing: -0.3px;
          }
          .pro-dash-trade {
            margin: 0;
            color: rgba(255,255,255,0.72);
            font-size: 12.5px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .pro-dash-hero-actions {
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .pro-dash-btn-primary {
            background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
            color: #0F0D09;
            border: none;
            padding: 11px 20px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            box-shadow: 0 4px 14px rgba(212,175,55,0.35);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .pro-dash-btn-primary:active { transform: scale(0.96); }
          .pro-dash-btn-secondary {
            background: rgba(255,255,255,0.08);
            color: #FFFFFF;
            border: 1px solid rgba(255,255,255,0.18);
            padding: 11px 16px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 12.5px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.15s ease;
          }
          .pro-dash-btn-secondary:active { transform: scale(0.96); }

          .pro-dash-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 24px;
            border-bottom: 1.5px solid #E8E3DA;
            padding-bottom: 10px;
            flex-wrap: wrap;
          }
          .pro-dash-projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
          }
          .pro-dash-form-box {
            background: #FFFFFF;
            border-radius: 18px;
            padding: 28px;
            border: 1px solid #E8E3DA;
            max-width: 800px;
          }
          .pro-dash-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .pro-dash-quote-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 20px;
            border-radius: 14px;
            background: #FAF9F6;
            border: 1px solid #E8E3DA;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .pro-dash-quote-actions {
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .pro-dash-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
          }
          .pro-dash-desktop-switch { display: inline-flex !important; }
          .pro-dash-desktop-avatar { display: block !important; }
          .pro-dash-mobile-top-actions { display: none !important; }
          .pro-title-desktop { display: inline-flex !important; align-items: center; gap: 6px; }
          .pro-title-mobile { display: none !important; }

          /* ── Adaptation Mobile Ultra-Épurée (<= 768px) ── */
          @media (max-width: 768px) {
            .pro-title-desktop { display: none !important; }
            .pro-title-mobile { display: inline-flex !important; align-items: center !important; gap: 5px !important; }
            .pro-dash-desktop-switch { display: none !important; }
            .pro-dash-desktop-avatar { display: none !important; }
            .pro-dash-mobile-top-actions { display: flex !important; }
            .pro-switch-txt-desktop { display: none !important; }
            .pro-switch-txt-mobile { display: inline !important; }
            .pro-dash-main {
              height: auto !important;
              min-height: 100vh !important;
              min-height: 100dvh !important;
              overflow: visible !important;
            }
            .pro-dash-topbar {
              padding: max(env(safe-area-inset-top, 44px), 38px) 14px 12px !important;
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 10px !important;
            }
            .pro-dash-top-brand {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              width: 100% !important;
            }
            .pro-dash-sub-text {
              display: none !important;
            }
            .pro-dash-top-badges {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
              width: 100% !important;
              overflow-x: auto !important;
              padding-bottom: 2px !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
            }
            .pro-dash-top-badges::-webkit-scrollbar {
              display: none !important;
            }
            .pro-dash-badge-item {
              flex: 0 0 auto !important;
              white-space: nowrap !important;
              padding: 5px 11px !important;
              font-size: 11.5px !important;
              border-radius: 10px !important;
            }
            .pro-dash-content {
              padding: 14px 12px calc(env(safe-area-inset-bottom, 20px) + 90px) !important;
              overflow: visible !important;
              -webkit-overflow-scrolling: touch !important;
            }
            .pro-dash-hero {
              padding: 16px 14px !important;
              border-radius: 16px !important;
              margin-bottom: 14px !important;
            }
            .pro-dash-hero-info {
              width: 100% !important;
            }
            .pro-dash-name {
              font-size: 18px !important;
              margin-bottom: 4px !important;
            }
            .pro-dash-trade {
              font-size: 11.5px !important;
              margin-bottom: 12px !important;
            }
            .pro-dash-hero-actions {
              display: grid !important;
              grid-template-columns: 1.2fr 1fr !important;
              width: 100% !important;
              gap: 8px !important;
            }
            .pro-dash-btn-primary,
            .pro-dash-btn-secondary {
              width: 100% !important;
              justify-content: center !important;
              padding: 10px 8px !important;
              font-size: 11.5px !important;
              border-radius: 10px !important;
              white-space: nowrap !important;
              box-sizing: border-box !important;
            }
            .pro-dash-tabs {
              display: flex !important;
              overflow-x: auto !important;
              flex-wrap: nowrap !important;
              gap: 8px !important;
              padding-bottom: 8px !important;
              margin-bottom: 14px !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
            }
            .pro-dash-tabs::-webkit-scrollbar {
              display: none !important;
            }
            .pro-dash-tab-btn {
              white-space: nowrap !important;
              flex: 0 0 auto !important;
              font-size: 11.5px !important;
              padding: 8px 14px !important;
              border-radius: 10px !important;
            }
            .pro-dash-projects-grid {
              grid-template-columns: 1fr !important;
              gap: 14px !important;
            }
            .pro-dash-form-box {
              padding: 16px 14px !important;
              border-radius: 16px !important;
            }
            .pro-dash-form-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            .pro-dash-quote-card {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 12px !important;
              padding: 14px !important;
              border-radius: 14px !important;
            }
            .pro-dash-quote-actions {
              display: flex !important;
              width: 100% !important;
              gap: 8px !important;
            }
            .pro-dash-quote-actions button,
            .pro-dash-quote-actions a {
              flex: 1 !important;
              justify-content: center !important;
              font-size: 11.5px !important;
              padding: 9px 8px !important;
              white-space: nowrap !important;
            }
            .pro-dash-stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
            }
            .pro-dash-stat-card {
              padding: 14px 12px !important;
              border-radius: 14px !important;
            }
            .pro-dash-stat-card .val {
              font-size: 20px !important;
            }
          }
        `}</style>
        
        {/* TOPBAR FLUIDE & RESPONSIVE (PC & MOBILE) */}
        <header className="pro-dash-topbar">
          <div className="pro-dash-top-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F0D09', flexShrink: 0 }}>
                <Icons.Tools />
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 16.5, color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pro-title-desktop">Espace <span style={{ color: '#D4AF37' }}>Professionnel</span></span>
                  <span className="pro-title-mobile">Espace <span style={{ color: '#D4AF37' }}>Pro</span> <span style={{ fontSize: 9.5, background: 'rgba(212,175,55,0.15)', color: '#AA820A', border: '1px solid rgba(212,175,55,0.3)', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>Certifié</span></span>
                </div>
                <div className="pro-dash-sub-text" style={{ fontSize: 11.5, color: '#888' }}>
                  Artisans &amp; Experts de l'Habitat certifiés Piolo
                </div>
              </div>
            </div>

            {/* Actions rapides visibles uniquement sur mobile dans la rangée du haut */}
            <div className="pro-dash-mobile-top-actions" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
              <button
                className="pro-dash-switch-btn"
                onClick={() => setIsAvailable(!isAvailable)}
                style={{
                  border: isAvailable ? '1.5px solid #2ECC71' : '1.5px solid #E74C3C',
                  background: isAvailable ? '#EAFAF1' : '#FDEDEC',
                  color: isAvailable ? '#27AE60' : '#C0392B',
                  padding: '5px 9px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title={isAvailable ? 'Disponible pour chantiers' : 'Indisponible'}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAvailable ? '#2ECC71' : '#E74C3C', boxShadow: isAvailable ? '0 0 6px #2ECC71' : 'none' }}></span>
                <span>{isAvailable ? 'Dispo' : 'Occupé'}</span>
              </button>

              <UserAvatarMenu />
            </div>
          </div>

          <div className="pro-dash-top-badges">
            {/* BADGE VUES & NOTORIÉTÉ RÉELLE */}
            <div className="pro-dash-badge-item" title={t('pro_dashboard.views_tooltip')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#AA820A"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              <span className="val">{proProfile.views_count || 0}</span>
              <span className="lbl">{t('pro_dashboard.views', 'Vues')}</span>
            </div>

            {/* BADGE POINTS / ABONNEMENT */}
            <div className="pro-dash-badge-item pro-dash-pts-badge" onClick={() => setSubscriptionModalOpen(true)} title={t('pro_dashboard.points_tooltip')}>
              <span className="val" style={{ color: activePlan ? '#27AE60' : '#AA820A' }}>
                {activePlan ? `👑 ${activePlan.name}` : `★ ${points} Points`}
              </span>
              <span className="action-tag">{activePlan ? 'VIP' : '+ Recharger'}</span>
            </div>

            {/* SWITCH DISPONIBILITÉ (DESKTOP) */}
            <button
              className="pro-dash-switch-btn pro-dash-desktop-switch"
              onClick={() => setIsAvailable(!isAvailable)}
              style={{
                border: isAvailable ? '1.5px solid #2ECC71' : '1.5px solid #E74C3C',
                background: isAvailable ? '#EAFAF1' : '#FDEDEC',
                color: isAvailable ? '#27AE60' : '#C0392B',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 20,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer'
              }}
              title={isAvailable ? 'Disponible pour chantiers' : 'Indisponible'}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isAvailable ? '#2ECC71' : '#E74C3C', boxShadow: isAvailable ? '0 0 8px #2ECC71' : 'none' }}></span>
              <span>{isAvailable ? 'Disponible pour chantiers' : 'Indisponible'}</span>
            </button>

            {/* AVATAR DESKTOP */}
            <div className="pro-dash-desktop-avatar" style={{ flexShrink: 0 }}>
              <UserAvatarMenu />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="pro-dash-content" style={{ flex: 1, padding: '24px 28px' }}>
          {/* HERO PRO BANNER ULTRA-ÉPURÉ & LUXUEUX */}
          <div className="pro-dash-hero">
            <div className="pro-dash-hero-inner">
              <div className="pro-dash-hero-info">
                <div className="pro-dash-cert-pill">
                  <Icons.CheckBadge />
                  <span>{t('pro_dashboard.certified_profile')}</span>
                  <span className="sep">•</span>
                  <span className="rating"><Icons.Star /> {proProfile.rating ? Number(proProfile.rating).toFixed(1) : '5.0'}/5</span>
                  <span className="reviews-count">({proProfile.reviews_count ?? (proProfile.reviews ? proProfile.reviews.length : 0)} avis)</span>
                </div>

                <h1 className="pro-dash-name">
                  {proProfile.business_name || proProfile.businessName || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Artisan Piolo')}
                </h1>

                <p className="pro-dash-trade">
                  <Icons.Location />
                  <span>{proProfile.primary_trade || proProfile.primaryTrade || 'Artisan du Bâtiment & Habitat'} • Intervention sur <strong>{proProfile.city || 'Yaoundé'}</strong> {proProfile.neighborhoods ? `(${proProfile.neighborhoods})` : ''}</span>
                </p>
              </div>

              <div className="pro-dash-hero-actions">
                <button
                  onClick={handleOpenAddProject}
                  className="pro-dash-btn-primary"
                >
                  <Icons.Plus />
                  <span>{t('pro_dashboard.add_project', 'Ajouter réalisation')}</span>
                </button>

                <Link
                  to="/architectes"
                  className="pro-dash-btn-secondary"
                >
                  <Icons.Eye />
                  <span>{t('pro_dashboard.public_directory', 'Voir annuaire')}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ONGLETS NAVIGATION (SCROLLABLE SUR MOBILE) */}
          <div className="pro-dash-tabs">
            {[
              { id: 'portfolio', label: t('pro_dashboard.tabs.portfolio'), icon: <Icons.Camera />, count: projects.length },
              { id: 'profil', label: t('pro_dashboard.tabs.settings'), icon: <Icons.Settings /> },
              { id: 'devis', label: t('pro_dashboard.tabs.quotes'), icon: <Icons.FileText />, count: quotes.length },
              { id: 'stats', label: t('pro_dashboard.tabs.stats'), icon: <Icons.Chart /> }
            ].map(tab => (
              <button
                key={tab.id}
                className="pro-dash-tab-btn"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#0F0D09' : '#FFFFFF',
                  color: activeTab === tab.id ? '#F6D365' : '#555',
                  border: activeTab === tab.id ? '1.5px solid #0F0D09' : '1px solid #E8E3DA',
                  padding: '10px 18px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span style={{
                    background: activeTab === tab.id ? '#D4AF37' : '#EDE8DF',
                    color: activeTab === tab.id ? '#0F0D09' : '#666',
                    padding: '2px 7px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 800
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

        {/* CONTENU ONGLET : PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F0D09' }}>
                  Vos Réalisations Publiées
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>
                  Ces projets sont mis en valeur auprès des propriétaires et locataires sur Piolo.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {projects.some(p => p.videos && p.videos.length > 0) && (
                  <button
                    onClick={() => setDiscoveryVideoOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                      color: '#0F0D09',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    <span>Mode Découverte Vidéos ({projects.reduce((acc, p) => acc + (p.videos?.length || 0), 0)})</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddProject(true)}
                  style={{
                    background: '#0F0D09',
                    color: '#F6D365',
                    border: '1px solid #D4AF37',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Icons.Plus />
                  <span>{t('pro_dashboard.new_project')}</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="pro-dash-projects-grid">
                {[1, 2, 3].map(i => <SkeletonProjectCard key={i} />)}
              </div>
            ) : projects.length === 0 ? (
              <div style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
                borderRadius: 20,
                padding: '44px 24px',
                textAlign: 'center',
                border: '1.5px dashed rgba(212,175,55,0.45)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                margin: '10px 0 20px'
              }}>
                <div style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.06) 100%)',
                  border: '1.5px solid rgba(212,175,55,0.35)',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 20px rgba(212,175,55,0.18)'
                }}>
                  <Icons.Camera />
                </div>
                <h4 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F0D09' }}>
                  {t('pro_dashboard.no_projects', 'Aucune réalisation pour l\'instant')}
                </h4>
                <p style={{ color: '#666', fontSize: 13.5, maxWidth: 460, margin: '0 auto 22px', lineHeight: 1.6 }}>
                  Ajoutez vos premières photos de chantiers, meubles fabriqués ou rénovations pour attirer des clients et valoriser votre savoir-faire sur Piolo.
                </p>
                <button
                  onClick={() => setShowAddProject(true)}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                    color: '#0F0D09',
                    border: 'none',
                    padding: '13px 26px',
                    borderRadius: 14,
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 6px 20px rgba(212,175,55,0.35)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    margin: '0 auto'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(212,175,55,0.35)'; }}
                >
                  <Icons.Plus />
                  <span>Ajouter ma première réalisation</span>
                </button>
              </div>
            ) : (
              <div className="pro-dash-projects-grid">
                {projects.map(proj => (
                  <div
                    key={proj.id}
                    style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E3DA', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}
                  >
                    <div
                      style={{ position: 'relative', height: 200, background: '#111', cursor: 'pointer' }}
                      onClick={() => setSelectedProjectModal({ ...proj, author: proProfile })}
                      title="{t('pro_dashboard.click_to_view_details')}"
                    >
                      <img
                        src={getMediaUrl(proj.main_image_display || proj.image || proj.main_image_url || proj.main_image, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80')}
                        alt={proj.title}
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15,13,9,0.85)', color: '#F6D365', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1px solid rgba(212,175,55,0.4)' }}>
                        {proj.category}
                      </div>

                      {proj.videos && proj.videos.length > 0 && (
                        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', color: '#0F0D09', padding: '3px 9px', borderRadius: 8, fontSize: 10.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                          <span>{proj.videos.length} Vidéo{proj.videos.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestDeleteProject(proj);
                        }}
                        title="{t('pro_dashboard.delete_project')}"
                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(231,76,60,0.9)', color: '#FFF', border: 'none', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#888', marginBottom: 4 }}>
                        <Icons.Location />
                        <span>{proj.city}</span>
                        <span>•</span>
                        <Icons.Clock />
                        <span>{proj.duration}</span>
                      </div>
                      <h4
                        onClick={() => setSelectedProjectModal({ ...proj, author: proProfile })}
                        style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 16, color: '#0F0D09', cursor: 'pointer' }}
                      >
                        {proj.title}
                      </h4>
                      <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#555', lineHeight: 1.5, flex: 1 }}>
                        {proj.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F0ECE4', fontSize: 11.5, color: '#888' }}>
                        <button
                          onClick={() => setSelectedProjectModal({ ...proj, author: proProfile })}
                          style={{ background: 'rgba(212,175,55,0.12)', color: '#AA820A', border: '1px solid rgba(212,175,55,0.3)', padding: '5px 10px', borderRadius: 8, fontWeight: 700, fontSize: 11.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                          <span>{t('pro_dashboard.project_details_preview')}</span>
                        </button>
                        <span style={{ color: '#D4AF37', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icons.Heart /> {proj.likes} appréciations
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET : CONFIGURATION MÉTIER & PROFIL */}
        {activeTab === 'profil' && (
          <div className="pro-dash-form-box">
            <h3 style={{ margin: '0 0 4px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F0D09' }}>
              Paramètres de votre Entreprise / Activité
            </h3>
            <p style={{ color: '#777', fontSize: 13, marginBottom: 24 }}>
              Définissez vos spécialités et coordonnées pour recevoir des demandes directes.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                  Nom commercial ou Nom de l'Artisan
                </label>
                <input
                  type="text"
                  value={proProfile.business_name || proProfile.businessName || ''}
                  onChange={(e) => setProProfile({ ...proProfile, business_name: e.target.value, businessName: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                  Corps de Métier Principal
                </label>
                <select
                  value={proProfile.primary_trade || proProfile.primaryTrade || 'Menuisier & Ébéniste (Meubles sur-mesure)'}
                  onChange={(e) => setProProfile({ ...proProfile, primary_trade: e.target.value, primaryTrade: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, fontFamily: 'inherit', background: '#FFF', boxSizing: 'border-box' }}
                >
                  {PRO_CATEGORIES.flatMap(cat => cat.trades).map((trade, idx) => (
                    <option key={idx} value={trade}>{trade}</option>
                  ))}
                </select>
              </div>

              <div className="pro-dash-form-grid">
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                    Ville Principale d'Implantation
                  </label>
                  <select
                    value={proProfile.city || 'Yaoundé'}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      const cityInfo = CAMEROON_LOCATIONS[newCity];
                      const newCoords = cityInfo ? cityInfo.coords : [3.8480, 11.5021];
                      setProProfile(prev => ({
                        ...prev,
                        city: newCity,
                        latitude: newCoords[0],
                        longitude: newCoords[1]
                      }));
                    }}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, background: '#FFF', boxSizing: 'border-box' }}
                  >
                    <option value="Yaoundé">{t('pro.cities.yaounde')}</option>
                    <option value="Douala">{t('pro.cities.douala')}</option>
                    <option value="Bafoussam">{t('pro.cities.bafoussam')}</option>
                    <option value="Kribi">{t('pro.cities.kribi')}</option>
                    <option value="Limbé">{t('pro.cities.limbe')}</option>
                    <option value="Buea">{t('pro.cities.buea')}</option>
                    <option value="Bamenda">{t('pro.cities.bamenda')}</option>
                    <option value="Garoua">{t('pro.cities.garoua')}</option>
                    <option value="Maroua">{t('pro.cities.maroua')}</option>
                    <option value="Ngaoundéré">{t('pro.cities.ngaoundere')}</option>
                    <option value="Bertoua">{t('pro.cities.bertoua')}</option>
                    <option value="Ebolowa">{t('pro.cities.ebolowa')}</option>
                    <option value="Dschang">{t('pro.cities.dschang')}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                    Années d'expérience
                  </label>
                  <input
                    type="text"
                    value={proProfile.experience_years || proProfile.experienceYears || ''}
                    onChange={(e) => setProProfile({ ...proProfile, experience_years: e.target.value, experienceYears: e.target.value })}
                    placeholder="Ex: 5 ans, 10 ans..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Suggestions rapides de Quartiers */}
              {CAMEROON_LOCATIONS[proProfile.city || 'Yaoundé']?.neighborhoods && Object.keys(CAMEROON_LOCATIONS[proProfile.city || 'Yaoundé']?.neighborhoods).length > 0 && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#666', marginBottom: 6 }}>
                    Centrer la carte sur un secteur de {proProfile.city || 'Yaoundé'} :
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(CAMEROON_LOCATIONS[proProfile.city || 'Yaoundé']?.neighborhoods).map(([nName, coords], idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProProfile(prev => ({
                            ...prev,
                            neighborhoods: prev.neighborhoods ? (prev.neighborhoods.includes(nName) ? prev.neighborhoods : `${prev.neighborhoods}, ${nName}`) : nName,
                            latitude: coords[0],
                            longitude: coords[1]
                          }));
                        }}
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid #D4AF37',
                          color: '#0F0D09',
                          padding: '5px 12px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#AA820A">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>{nName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                  Quartiers, Adresse de l'Atelier &amp; Zones d'intervention
                </label>
                <input
                  type="text"
                  value={proProfile.neighborhoods || ''}
                  onChange={(e) => setProProfile({ ...proProfile, neighborhoods: e.target.value })}
                  placeholder="Ex: Bastos (Atelier face Dovv), Odza, Omnisports, Melen, Soa..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11.5, color: '#888', marginTop: 4 }}>
                  Indiquez votre quartier d'implantation ainsi que les zones de déplacement de vos équipes.
                </div>
              </div>

              {/* CARTE SATELLITE GOOGLE MAPS DU POSITIONNEMENT EXACT */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#0F0D09' }}>
                    Emplacement exact de l'Atelier sur Google Maps (Satellite &amp; Plan)
                  </label>
                </div>
                <p style={{ fontSize: 12, color: '#777', margin: '0 0 10px' }}>
                  Ajustez la vue Satellite pour positionner le repère doré sur votre bâtiment ou atelier.
                </p>
                <ProLocationPickerMap
                  latitude={proProfile.latitude || (CAMEROON_LOCATIONS[proProfile.city || 'Yaoundé']?.coords[0] || 3.8480)}
                  longitude={proProfile.longitude || (CAMEROON_LOCATIONS[proProfile.city || 'Yaoundé']?.coords[1] || 11.5021)}
                  city={proProfile.city || 'Yaoundé'}
                  title={proProfile.business_name || "Mon Atelier"}
                  height={340}
                  onLocationChange={(lat, lng) => {
                    setProProfile(prev => ({ ...prev, latitude: lat, longitude: lng }));
                  }}
                />
              </div>

              <div className="pro-dash-form-grid">
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                    Numéro WhatsApp Pro (Clients)
                  </label>
                  <input
                    type="text"
                    value={proProfile.whatsapp || ''}
                    onChange={(e) => setProProfile({ ...proProfile, whatsapp: e.target.value })}
                    placeholder="+237 6XX XX XX XX"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                    Tarification indicative
                  </label>
                  <input
                    type="text"
                    value={proProfile.pricing_indicative || proProfile.minPrice || ''}
                    onChange={(e) => setProProfile({ ...proProfile, pricing_indicative: e.target.value, minPrice: e.target.value })}
                    placeholder="Ex: Devis gratuit / À partir de 10 000 FCFA"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#0F0D09', marginBottom: 6 }}>
                  Présentation de vos services / Savoir-faire
                </label>
                <textarea
                  rows={4}
                  value={proProfile.bio || ''}
                  onChange={(e) => setProProfile({ ...proProfile, bio: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                    color: '#0F0D09',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                    opacity: isSavingProfile ? 0.75 : 1,
                    boxShadow: '0 4px 14px rgba(212,175,55,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {isSavingProfile ? (
                    <>
                      <span style={{ width: 14, height: 14, border: '2px solid #0F0D09', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                      <span>{t('pro_dashboard.saving')}</span>
                    </>
                  ) : (
                    <span>{t('pro_dashboard.save_changes')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CONTENU ONGLET : DEMANDES DE DEVIS */}
        {activeTab === 'devis' && (
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: 24, border: '1px solid #E8E3DA' }}>
            <h3 style={{ margin: '0 0 16px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F0D09' }}>
              {t('pro_dashboard.tabs.quotes')} Reçus ({quotes.length})
            </h3>
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <SkeletonQuoteCard />
                <SkeletonQuoteCard />
                <SkeletonQuoteCard />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {quotes.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 700, color: '#0F0D09' }}>{t('pro_dashboard.no_quotes')}</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>{t('pro_dashboard.quotes_desc')}</div>
                  </div>
                ) : (
                  quotes.map((d, i) => (
                    <div
                      key={d.id || i}
                      className="pro-dash-quote-card"
                    >
                      <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: '#0F0D09', fontSize: 15.5 }}>{d.client_name || 'Client Piolo'}</span>
                          <span style={{ background: '#D4AF37', color: '#0F0D09', padding: '2px 8px', borderRadius: 10, fontSize: 10.5, fontWeight: 800 }}>{d.status || 'Nouveau'}</span>
                          <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icons.Location /> {d.city || 'Yaoundé'}
                          </span>
                        </div>
                        <div style={{ fontSize: 13.5, color: '#333', fontWeight: 600 }}>{d.project_type || 'Demande de devis'} — {d.description || 'Voir détails'}</div>
                        <div style={{ fontSize: 11.5, color: '#888', marginTop: 4 }}>
                          Reçu le {d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : 'Aujourd’hui'} • Tél: {d.client_phone || 'Non renseigné'}
                        </div>
                      </div>
                      <div className="pro-dash-quote-actions">
                        <button
                          onClick={() => setSelectedQuoteModal(d)}
                          style={{
                            background: '#FFFFFF',
                            color: '#0F0D09',
                            border: '1.5px solid #E8E3DA',
                            padding: '9px 15px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                          <span>Voir les Détails</span>
                        </button>

                        <a
                          href={`https://wa.me/${(d.client_phone || '').replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(d.client_name || 'Client')},%20je%20fais%20suite%20à%20votre%20demande%20de%20devis%20sur%20Piolo%20concernant%20le%20projet%20«%20${encodeURIComponent(d.project_type || 'Travaux')}%20».`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#25D366',
                            color: '#FFF',
                            padding: '9px 16px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12.5,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 3px 10px rgba(37,211,102,0.25)'
                          }}
                        >
                          <Icons.WhatsApp />
                          <span>Répondre sur WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET : STATISTIQUES */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="pro-dash-stats-grid">
              {[
                { label: 'Visites de votre Profil Pro', value: `${proProfile.views_count || 0}`, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>, sub: 'Clients ayant exploré votre vitrine' },
                { label: 'Demandes de Devis Reçues', value: quotes.length, icon: <Icons.FileText />, sub: `${quotes.length} contact${quotes.length > 1 ? 's' : ''} direct${quotes.length > 1 ? 's' : ''}` },
                { label: 'Chantiers & Projets en ligne', value: projects.length, icon: <Icons.Camera />, sub: `${projects.length} réalisation${projects.length > 1 ? 's' : ''} visible${projects.length > 1 ? 's' : ''}` },
                { label: 'Note moyenne certifiée', value: `${(proProfile.rating || 5.0).toFixed(1)}/5`, icon: <Icons.Star />, sub: `Basé sur ${proProfile.reviews_count || (proProfile.reviews ? proProfile.reviews.length : 0)} avis vérifiés` },
                { label: 'Solde de Points Piolo', value: `${points} pts`, icon: <Icons.Tools />, sub: activePlan ? `Abonnement ${activePlan.name}` : 'Rechargeable à tout moment' },
              ].map((st, sIdx) => (
                <div key={sIdx} className="pro-dash-stat-card" style={{ background: '#FFFFFF', padding: 22, borderRadius: 16, border: '1px solid #E8E3DA', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#777', fontWeight: 700 }}>{st.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.15)', color: '#AA820A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {st.icon}
                    </div>
                  </div>
                  <div className="val" style={{ fontSize: 26, fontWeight: 900, color: '#0F0D09', fontFamily: 'Poppins, sans-serif' }}>
                    {st.value}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#AA820A', marginTop: 4, fontWeight: 700 }}>
                    {st.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* BANNER PERFORMANCE & AUDIENCE */}
            <div style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1F1B14 100%)', borderRadius: 18, padding: 24, color: '#FFF', border: '1px solid #D4AF37', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.18)', color: '#F6D365', fontSize: 11.5, fontWeight: 800, padding: '4px 12px', borderRadius: 12, border: '1px solid rgba(212,175,55,0.3)', marginBottom: 8 }}>
                  <span>📊 {t('pro_dashboard.conversion_indicator')}</span>
                </div>
                <h4 style={{ margin: '0 0 6px', fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 800, color: '#FFF' }}>
                  Votre vitrine artisanale a attiré {proProfile.views_count || 0} visiteur{(proProfile.views_count || 0) > 1 ? 's' : ''} unique{(proProfile.views_count || 0) > 1 ? 's' : ''}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#AAA', maxWidth: 540, lineHeight: 1.5 }}>
                  Chaque publication de chantier avec des photos <em>Avant / Après</em> et une galerie complémentaire augmente votre taux de conversion et votre classement dans l'Annuaire Piolo.
                </p>
              </div>

              <button
                onClick={() => setShowAddProject(true)}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                  color: '#0F0D09',
                  padding: '12px 20px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13.5,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                }}
              >
                + Publier un nouveau chantier
              </button>
            </div>
          </div>
        )}

        {/* TOAST FEEDBACK NOTIFICATION */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 10010,
            background: toastMessage.startsWith('❌') ? '#FDEDEC' : '#0F0D09',
            color: toastMessage.startsWith('❌') ? '#C0392B' : '#F6D365',
            border: toastMessage.startsWith('❌') ? '1.5px solid #E74C3C' : '1.5px solid #D4AF37',
            padding: '14px 22px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MODAL AJOUT DE PROJET COMPLET AVEC MULTI-PHOTOS & AVANT/APRÈS */}
        {showAddProject && (
          <ProAddProjectModal
            onClose={() => setShowAddProject(false)}
            onSaveProject={handlePreSaveProject}
          />
        )}

        {/* MODAL CONFIRMATION DE PUBLICATION (DÉDUCTION DE 5 POINTS) */}
        {pendingPublishProject && (
          <ProPublishConfirmModal
            project={pendingPublishProject}
            currentPoints={points}
            activePlan={activePlan}
            isSubmitting={isPublishingProject}
            onConfirm={handleConfirmPublish}
            onCancel={() => !isPublishingProject && setPendingPublishProject(null)}
          />
        )}

        {/* MODAL CONFIRMATION DE SUPPRESSION DE PROJET */}
        {pendingDeleteProject && (
          <ProDeleteConfirmModal
            project={pendingDeleteProject}
            onConfirm={handleConfirmDelete}
            onCancel={() => setPendingDeleteProject(null)}
          />
        )}

        {/* MODAL DÉTAILS DU CHANTIER HAUT DE GAMME */}
        {selectedProjectModal && (
          <ProProjectDetailModal
            project={selectedProjectModal}
            currentUser={user}
            onClose={() => setSelectedProjectModal(null)}
          />
        )}

        {/* MODAL MODE DÉCOUVERTE VIDÉOS IMMERSIF (REELS PRO) */}
        {discoveryVideoOpen && (
          <ProDiscoveryVideoModal
            projects={projects}
            onClose={() => setDiscoveryVideoOpen(false)}
            onSelectProject={(proj) => {
              setDiscoveryVideoOpen(false);
              setSelectedProjectModal({ ...proj, author: proProfile });
            }}
          />
        )}

        {/* MODAL DÉTAILS DE LA DEMANDE DE DEVIS CLIENT */}
        {selectedQuoteModal && (
          <ProQuoteDetailModal
            quote={selectedQuoteModal}
            onClose={() => setSelectedQuoteModal(null)}
          />
        )}

        {/* MODAL ABONNEMENTS ET RECHARGE DE POINTS */}
        {subscriptionModalOpen && (
          <ProSubscriptionModal
            currentPoints={points}
            onClose={() => setSubscriptionModalOpen(false)}
            onRechargeSuccess={(addedPts) => {
              const newPts = proProjectsService.addPoints(user?.id, addedPts);
              setPoints(newPts);
            }}
            onSubscribeSuccess={(planObj) => {
              setActivePlan(planObj);
              localStorage.setItem(`piolo_pro_plan_${user?.id}`, JSON.stringify(planObj));
            }}
          />
        )}

        </div> {/* Fin de div scrollable */}
      </div> {/* Fin de div main */}
      <MobileBottomNav />
    </div>
  );
}
