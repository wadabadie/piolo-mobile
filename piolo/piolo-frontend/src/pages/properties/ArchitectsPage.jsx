import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import MobileBottomNav from '../../components/MobileBottomNav';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import ProBudgetCalculator from '../../components/ProBudgetCalculator';
import ProEscrowModal from '../../components/ProEscrowModal';
import ProQuoteRequestModal from '../../components/ProQuoteRequestModal';
import ProProjectDetailModal from '../../components/ProProjectDetailModal';
import ProProfileDetailModal from '../../components/ProProfileDetailModal';
import ProDiscoveryVideoModal from '../../components/ProDiscoveryVideoModal';
import { professionalsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../utils/media';
import '../bailleur/dashboard.css';

// SVG Icons
const Icons = {
  Tools: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
    </svg>
  ),
  Location: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  CheckBadge: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2ECC71">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
    </svg>
  ),
  FileText: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  )
};

/* ─── Skeleton Loading Components pour Annuaire ─── */
const SkeletonVitrineCardDesktop = () => (
  <div style={{ background: 'var(--gris-f)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--gris-b)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 140, width: '100%', background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '80%', height: 16, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '100%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginTop: 6 }} />
    </div>
  </div>
);

const SkeletonVitrineCardMobile = () => (
  <div style={{ minWidth: 230, maxWidth: 250, flex: '0 0 auto', background: 'var(--gris-f)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--gris-b)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 125, width: '100%', background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ width: '45%', height: 10, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '85%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginTop: 4 }} />
    </div>
  </div>
);

const SkeletonProCardDesktop = () => (
  <div style={{ background: 'var(--blanc)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--gris-b)', boxShadow: '0 6px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 130, width: '100%', background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '0 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginTop: -26, marginBottom: 10, width: 54, height: 54, borderRadius: '50%', border: '3.5px solid var(--blanc)', background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '35%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 8 }} />
      <div style={{ width: '65%', height: 18, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 6 }} />
      <div style={{ width: '45%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 12 }} />
      <div style={{ width: '100%', height: 46, borderRadius: 12, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <div style={{ width: 65, height: 22, borderRadius: 12, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: 75, height: 22, borderRadius: 12, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <div style={{ flex: 1, height: 38, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ flex: 1, height: 38, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  </div>
);

const SkeletonProCardMobile = () => (
  <div style={{ background: 'var(--blanc)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--gris-b)', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 110, width: '100%', background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '0 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginTop: -24, marginBottom: 8, width: 48, height: 48, borderRadius: '50%', border: '3.5px solid var(--blanc)', background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: '40%', height: 10, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 6 }} />
      <div style={{ width: '70%', height: 16, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 5 }} />
      <div style={{ width: '50%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 10 }} />
      <div style={{ width: '100%', height: 38, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{ width: 60, height: 20, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: 70, height: 20, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <div style={{ flex: 1, height: 36, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ flex: 1, height: 36, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  </div>
);

export default function ArchitectsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactModal, setContactModal] = useState(null);
  const [quoteProjectModal, setQuoteProjectModal] = useState(null);
  const [selectedProModal, setSelectedProModal] = useState(null);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [discoveryVideoOpen, setDiscoveryVideoOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [escrowModalData, setEscrowModalData] = useState(null);

  const [pros, setPros] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const vitrineRailRef = useRef(null);

  // Auto-scroll horizontal fluide de la vitrine sur mobile
  useEffect(() => {
    const scrollVitrine = () => {
      if (!vitrineRailRef.current) return;
      const el = vitrineRailRef.current;
      if (el.matches(':hover') || el.matches(':active')) return;
      
      const item = el.querySelector('.arch-vitrine-card');
      const step = item ? item.offsetWidth + 14 : 260;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 5) return;
      
      if (el.scrollLeft + step >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const interval = setInterval(scrollVitrine, 4000);
    return () => clearInterval(interval);
  }, []);

  const [searchParams] = useSearchParams();
  const targetProjectId = searchParams.get('project');
  const targetProId = searchParams.get('pro');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prosRes, projRes] = await Promise.all([
        professionalsApi.list({ category: filter, city: cityFilter, search: searchQuery }),
        professionalsApi.projects()
      ]);
      
      const mappedPros = (prosRes.data || []).map(p => {
        const latestProjectImg = p.projects && p.projects.length > 0 
          ? (p.projects[0].main_image_display || p.projects[0].image || p.projects[0].main_image_url) 
          : null;
        const avatar = p.avatar_url || p.user_avatar || p.user?.avatar || p.avatar || null;

        return {
          id: p.id,
          name: p.business_name || 'Artisan Piolo',
          title: p.primary_trade || 'Artisan du Bâtiment & Habitat',
          specialty: p.primary_trade || 'Artisan du Bâtiment & Habitat',
          category: p.primary_trade || 'Habitat',
          city: p.city || 'Yaoundé',
          rating: p.rating || 5.0,
          reviewsCount: p.reviews_count || 0,
          projectsCount: p.projects_count || (p.projects ? p.projects.length : 0),
          experience: p.experience_years || '5 ans',
          pointsRequired: '2 pts',
          verified: p.is_verified !== false,
          phone: p.phone || p.whatsapp,
          whatsapp: p.whatsapp || p.phone,
          avatarUrl: avatar ? getMediaUrl(avatar) : null,
          cover: getMediaUrl(p.cover_image_url || latestProjectImg, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'),
          initials: (p.business_name || 'Pro').substring(0, 2).toUpperCase(),
          avatarBg: 'linear-gradient(135deg, #D4AF37 0%, #8C6D1F 100%)',
          availColor: p.is_available !== false ? '#2ECC71' : '#E74C3C',
          availText: p.is_available !== false ? 'Disponible maintenant' : 'Indisponible',
          tags: p.secondary_trades && p.secondary_trades.length > 0 ? p.secondary_trades : ['Rénovation', 'Design int.', 'Plans 3D'],
          bio: p.bio || `Artisan certifié Piolo opérant sur ${p.city || 'Yaoundé'}.`,
          projects: p.projects || [],
          raw: p
        };
      });

      const loadedProjects = projRes.data || [];
      setPros(mappedPros);
      setProjectsList(loadedProjects);

      // Si un projet spécifique est ciblé dans l'URL, ouvrir sa modale immédiatement
      if (targetProjectId) {
        const found = loadedProjects.find(p => String(p.id) === String(targetProjectId));
        if (found) {
          setSelectedProjectModal(found);
        } else {
          // Chercher dans les projets des pros
          for (const pro of mappedPros) {
            const pr = (pro.projects || []).find(p => String(p.id) === String(targetProjectId));
            if (pr) {
              setSelectedProjectModal({ ...pr, author: pro });
              break;
            }
          }
        }
      } else if (targetProId) {
        const foundPro = mappedPros.find(p => String(p.id) === String(targetProId));
        if (foundPro) {
          setSelectedProModal(foundPro);
        }
      }
    } catch (err) {
      console.error('Erreur chargement annuaire pro BDD:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, cityFilter, searchQuery, targetProjectId, targetProId]);

  return (
    <div className="layout">
      <Sidebar />

      <div className="main arch-main" style={{ padding: 24, background: 'var(--gris-f)', minHeight: '100vh' }}>
        <style>{`
          .arch-page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: var(--blanc);
            padding: 16px 22px;
            border-radius: 18px;
            border: 1px solid var(--gris-b);
            box-shadow: 0 4px 14px rgba(0,0,0,0.03);
          }
          .arch-header-top-row {
            display: flex;
            align-items: center;
          }
          .arch-header-title-box {
            flex: 1;
            min-width: 0;
          }
          .arch-header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .arch-mobile-avatar {
            display: none;
          }
          .arch-desktop-avatar {
            display: block;
          }
          .arch-skeleton-desktop {
            display: contents;
          }
          .arch-skeleton-mobile {
            display: none;
          }
          .arch-hero {
            background: linear-gradient(135deg, #0F0D09 0%, #1E1A12 100%);
            border-radius: 20px;
            padding: 28px 30px;
            color: #FFFFFF;
            margin-bottom: 20px;
            border: 1px solid rgba(212,175,55,0.3);
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
          }
          .arch-search-container {
            background: var(--blanc);
            border: 1px solid var(--gris-b);
          }
          .arch-vitrine-box {
            background: var(--blanc);
            border: 1px solid var(--gris-b);
          }
          .arch-vitrine-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 14px;
          }
          .arch-pros-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
          }
          .arch-mobile-swipe-hint {
            display: none;
          }
          .arch-vitrine-card {
            background: var(--gris-f);
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid var(--gris-b);
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
          }
          .arch-vitrine-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          }
          .arch-pro-card {
            background: var(--blanc);
            border: 1px solid var(--gris-b);
          }

          html.dark .arch-page-header {
            background: var(--blanc) !important;
            border-color: var(--gris-b) !important;
          }
          html.dark .arch-search-container {
            background: var(--blanc) !important;
            border-color: var(--gris-b) !important;
          }
          html.dark .arch-vitrine-box {
            background: var(--blanc) !important;
            border-color: var(--gris-b) !important;
          }
          html.dark .arch-vitrine-card {
            background: var(--gris-f) !important;
            border-color: var(--gris-b) !important;
          }
          html.dark .arch-pro-card {
            background: var(--blanc) !important;
            border-color: var(--gris-b) !important;
          }

          /* ── Adaptation Mobile Premium & Professionnelle (<= 768px) ── */
          @media (max-width: 768px) {
            .arch-main {
              height: auto !important;
              min-height: 100vh !important;
              overflow-x: hidden !important;
              overflow-y: visible !important;
              padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 90px) !important;
              box-sizing: border-box !important;
            }
            .arch-page-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 12px !important;
              padding: max(env(safe-area-inset-top, 44px), 36px) 14px 14px !important;
              border-radius: 16px !important;
              margin-bottom: 16px !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
              width: 100% !important;
            }
            .arch-header-top-row {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              gap: 12px !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .arch-header-title-box {
              flex: 1 1 auto !important;
              min-width: 0 !important;
            }
            .arch-mobile-avatar {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              flex-shrink: 0 !important;
            }
            .arch-desktop-avatar {
              display: none !important;
            }
            .arch-header-actions {
              display: grid !important;
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
              width: 100% !important;
              gap: 8px !important;
              box-sizing: border-box !important;
            }
            .arch-btn-action {
              min-width: 0 !important;
              width: 100% !important;
              justify-content: center !important;
              padding: 9px 6px !important;
              font-size: 11px !important;
              border-radius: 10px !important;
              box-sizing: border-box !important;
              display: flex !important;
              align-items: center !important;
              gap: 5px !important;
            }
            .arch-btn-action span {
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              font-size: 11px !important;
            }
            .arch-btn-action svg {
              flex-shrink: 0 !important;
              width: 13px !important;
              height: 13px !important;
            }
            .arch-skeleton-desktop {
              display: none !important;
            }
            .arch-skeleton-mobile {
              display: contents !important;
            }
            .arch-hero {
              padding: 18px 16px !important;
              border-radius: 18px !important;
              margin-bottom: 16px !important;
              gap: 14px !important;
            }
            .arch-hero h1 {
              font-size: 19px !important;
              line-height: 1.3 !important;
            }
            .arch-hero p {
              font-size: 12px !important;
              line-height: 1.4 !important;
            }
            .arch-hero-btn {
              width: 100% !important;
              justify-content: center !important;
              padding: 12px 16px !important;
              font-size: 12.5px !important;
            }
            .arch-search-container {
              padding: 14px 12px !important;
              border-radius: 16px !important;
              margin-bottom: 16px !important;
            }
            .arch-search-inputs {
              flex-direction: column !important;
              gap: 10px !important;
              margin-bottom: 12px !important;
            }
            .arch-chips-row {
              display: flex !important;
              overflow-x: auto !important;
              flex-wrap: nowrap !important;
              gap: 8px !important;
              padding-bottom: 4px;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
            }
            .arch-chips-row::-webkit-scrollbar {
              display: none;
            }
            .arch-chip-btn {
              white-space: nowrap !important;
              flex: 0 0 auto !important;
              font-size: 11px !important;
              padding: 6px 12px !important;
            }
            .arch-vitrine-box {
              padding: 14px 12px !important;
              border-radius: 16px !important;
              margin-bottom: 20px !important;
            }
            .arch-vitrine-grid {
              display: flex !important;
              overflow-x: auto !important;
              scroll-snap-type: x mandatory;
              -webkit-overflow-scrolling: touch;
              gap: 12px !important;
              padding-bottom: 6px;
              margin: 0 -2px;
              scrollbar-width: none;
            }
            .arch-vitrine-grid::-webkit-scrollbar {
              display: none;
            }
            .arch-vitrine-card {
              min-width: 230px !important;
              max-width: 250px !important;
              flex: 0 0 auto !important;
              scroll-snap-align: start;
              border-radius: 14px !important;
            }
            .arch-pros-grid {
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 16px !important;
              margin-bottom: 24px !important;
            }
            .arch-pro-card {
              border-radius: 18px !important;
            }
            .arch-mobile-swipe-hint {
              display: inline-flex !important;
              align-items: center;
              gap: 4px;
              font-size: 10.5px;
              color: #D4AF37;
              font-weight: 700;
            }
          }
        `}</style>

        {/* EN-TÊTE DE PAGE HAUT DE GAMME */}
        <header className="arch-page-header">
          <div className="arch-header-top-row">
            <div className="arch-header-title-box">
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17.5, fontWeight: 800, color: 'var(--noir)' }}>
                Annuaire des <span style={{ color: '#D4AF37' }}>{t('architects.title')}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--gris)', marginTop: 2 }}>
                Trouvez menuisiers, électriciens, plombiers, architectes et décorateurs certifiés
              </div>
            </div>
            {/* User Avatar visible sur mobile en haut à droite */}
            <div className="arch-mobile-avatar">
              <UserAvatarMenu />
            </div>
          </div>

          <div className="arch-header-actions">
            <button
              className="arch-btn-action"
              onClick={() => setDiscoveryVideoOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                color: '#0F0D09',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(212,175,55,0.35)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              <span>{t('architects.badge_discovery')}</span>
            </button>

            <button
              className="arch-btn-action"
              onClick={() => setCalculatorOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0F0D09 0%, #1E1A12 100%)',
                color: '#F6D365',
                border: '1px solid rgba(212,175,55,0.4)',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              <span>{t('architects.btn_budget_calc')}</span>
            </button>

            {/* User Avatar visible sur grand écran / PC tout à droite */}
            <div className="arch-desktop-avatar">
              <UserAvatarMenu />
            </div>
          </div>
        </header>

        {/* HERO */}
        <div className="arch-hero">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', padding: '4px 12px', borderRadius: 20, color: '#F6D365', fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
              <Icons.Tools />
              <span>{t('architects.hero_title')}</span>
            </div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, margin: '0 0 6px', color: '#FFF' }}>
              Professionnels, BTP &amp; <span style={{ color: '#D4AF37' }}>Mobilier</span>
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 13.5, maxWidth: 650 }}>
              Trouvez les meilleurs artisans vérifiés pour concevoir vos plans, fabriquer vos meubles, équiper ou rénover votre logement au Cameroun.
            </p>
          </div>

          <button
            className="arch-hero-btn"
            onClick={() => setCalculatorOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
              color: '#0F0D09',
              border: 'none',
              padding: '14px 22px',
              borderRadius: 12,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <span>{t('architects.simulate_budget_btn')}</span>
          </button>
        </div>

        {/* RECHERCHE & FILTRES */}
        <div className="arch-search-container" style={{ padding: '16px 20px', borderRadius: 16, marginBottom: 20 }}>
          <div className="arch-search-inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <input
                type="text"
                placeholder={t("architects.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--blanc)', color: 'var(--noir)', border: '1.5px solid var(--gris-b)', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--gris-b)', fontSize: 13, background: 'var(--blanc)', color: 'var(--noir)', fontWeight: 600, boxSizing: 'border-box' }}
            >
              <option value="all">{t('pro.cities.all')}</option>
              <option value="yaoundé">{t('pro.cities.yaounde')}</option>
              <option value="douala">Douala</option>
            </select>
          </div>

          {/* CHIPS CATÉGORIES (DÉFILEMENT HORIZONTAL MOBILE) */}
          <div className="arch-chips-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'all', label: t('pro.categories.all') },
              { id: 'mobilier', label: 'Menuiserie, Mobilier & Déco' },
              { id: 'architecture', label: 'Architecture & BTP' },
              { id: 'plomberie', label: 'Plomberie & Climatisation' },
              { id: 'electricite', label: 'Électricité & Solaire' },
            ].map(cat => (
              <button
                key={cat.id}
                className="arch-chip-btn"
                onClick={() => setFilter(cat.id)}
                style={{
                  background: filter === cat.id ? '#0F0D09' : 'var(--gris-f)',
                  color: filter === cat.id ? '#F6D365' : 'var(--gris)',
                  border: filter === cat.id ? '1.5px solid #0F0D09' : '1px solid var(--gris-b)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* VITRINE DES DERNIERS CHANTIERS PUBLIÉS */}
        {loading ? (
          <div className="arch-vitrine-box" style={{ marginBottom: 30, padding: '20px 22px', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: '40%', height: 20, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ width: 120, height: 20, borderRadius: 10, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
            
            {/* Squelettes adaptatifs : PC Desktop vs Mobile */}
            <div className="arch-vitrine-grid">
              <div className="arch-skeleton-desktop">
                {[1, 2, 3, 4].map(i => <SkeletonVitrineCardDesktop key={i} />)}
              </div>
              <div className="arch-skeleton-mobile">
                {[1, 2, 3].map(i => <SkeletonVitrineCardMobile key={i} />)}
              </div>
            </div>
          </div>
        ) : (
          (() => {
            const allProjects = projectsList;
            if (!allProjects || allProjects.length === 0) return null;

            return (
              <div className="arch-vitrine-box" style={{ marginBottom: 30, padding: '20px 22px', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--noir)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icons.Tools />
                      <span>{t('architects.showcase_title')}</span>
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--gris)' }}>
                      Réalisations récentes publiées en temps réel par les artisans certifiés
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="arch-mobile-swipe-hint">{t('architects.swipe_hint')}</span>
                    <div style={{ background: 'rgba(212,175,55,0.12)', color: '#AA820A', padding: '4px 10px', borderRadius: 10, fontSize: 11.5, fontWeight: 700 }}>
                      {allProjects.length} réalisations en ligne
                    </div>
                  </div>
                </div>

                <div ref={vitrineRailRef} className="arch-vitrine-grid">
                  {allProjects.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className="arch-vitrine-card"
                      onClick={() => setSelectedProjectModal(p)}
                    >
                      <div style={{ position: 'relative', height: 140 }}>
                        <img
                          src={getMediaUrl(p.main_image_display || p.main_image_url || p.image, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80')}
                          alt={p.title}
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {(p.before_image_display || p.before_image_url || p.beforeImage) && (
                          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(15,13,9,0.88)', backdropFilter: 'blur(4px)', color: '#F6D365', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, border: '1px solid rgba(212,175,55,0.4)' }}>
                            Avant / Après
                          </div>
                        )}
                        {p.videos && p.videos.length > 0 && (
                          <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', color: '#0F0D09', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                            <span>{t('architects.badge_hd_video')}</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', color: '#FFF', padding: '2px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>
                          {p.city || 'Cameroun'}
                        </div>
                      </div>
                      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 10.5, color: '#AA820A', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>{p.category}</div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--noir)', lineHeight: 1.3 }}>{p.title}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--gris-b)', fontSize: 11, color: 'var(--gris)' }}>
                          <span>Par <strong>{p.author?.name || 'Artisan Piolo'}</strong></span>
                          <span style={{ color: '#D4AF37', fontWeight: 700 }}>{t('architects.see_details')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        )}

        {/* GRID PROFESSIONNELS STYLE PREMIUM */}
        <div className="arch-pros-grid">
          {loading ? (
            <>
              {/* Squelettes PC Desktop (Grille multi-colonnes) */}
              <div className="arch-skeleton-desktop">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonProCardDesktop key={i} />)}
              </div>
              {/* Squelettes Mobile (1-colonne épurée) */}
              <div className="arch-skeleton-mobile">
                {[1, 2, 3].map(i => <SkeletonProCardMobile key={i} />)}
              </div>
            </>
          ) : pros.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: 'var(--blanc)', padding: 40, borderRadius: 20, textAlign: 'center', border: '1px dashed var(--gris-b)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👷</div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--noir)' }}>{t('architects.empty_title')}</h3>
              <p style={{ color: 'var(--gris)', fontSize: 13 }}>{t('architects.empty_subtitle')}</p>
            </div>
          ) : (
            pros.map((pro) => (
            <div
              key={pro.id}
              className="arch-pro-card"
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* En-tête photo & badge certifié */}
              <div style={{ position: 'relative', height: 135, background: '#1A160F', overflow: 'hidden' }}>
                <img
                  src={getMediaUrl(pro.cover, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80')}
                  alt={pro.name}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
                
                <div style={{ position: 'absolute', top: 12, right: 12, background: '#D4AF37', color: '#0F0D09', padding: '4px 10px', borderRadius: 12, fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.25)', zIndex: 2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                  <span>Certifié Piolo</span>
                </div>
              </div>

              {/* Contenu de la fiche */}
              <div style={{ padding: '0 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Avatar rond complet sans rognage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -32, marginBottom: 10, position: 'relative', zIndex: 5 }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: pro.avatarBg || 'linear-gradient(135deg, #D4AF37, #AA820A)',
                    color: '#FFF',
                    fontWeight: 900,
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid var(--blanc)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {pro.avatarUrl ? (
                      <img
                        src={getMediaUrl(pro.avatarUrl)}
                        alt={pro.name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{pro.initials || pro.name?.[0] || 'P'}</span>
                    )}
                  </div>
                </div>

                {/* Disponibilité */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: pro.availColor || '#27AE60', fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: pro.availColor || '#27AE60', display: 'inline-block' }} />
                  <span>{pro.availText || 'Disponible maintenant'}</span>
                </div>

                {/* Nom & Titre */}
                <h3 style={{ margin: '0 0 3px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--noir)' }}>
                  {pro.name}
                </h3>
                <div style={{ fontSize: 11.5, color: '#AA820A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>{pro.city}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--gris)', fontWeight: 600, marginBottom: 8 }}>
                  {pro.specialty || pro.title}
                </div>

                {/* Note & avis */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gris)', marginBottom: 12 }}>
                  <span style={{ color: '#D4AF37', fontWeight: 800 }}>★ {pro.rating || '5.0'}</span>
                  <span>({pro.reviewsCount || 1} avis)</span>
                </div>

                {/* 3 mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: 'var(--gris-f)', padding: '8px 10px', borderRadius: 12, border: '1px solid var(--gris-b)', marginBottom: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 13, color: 'var(--noir)' }}>{pro.projectsCount || pro.projects?.length || 3}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--gris)', textTransform: 'uppercase', fontWeight: 700 }}>Projets</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--gris-b)', borderRight: '1px solid var(--gris-b)' }}>
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#AA820A' }}>{pro.experience || '5 ans'}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--gris)', textTransform: 'uppercase', fontWeight: 700 }}>Expérience</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#27AE60' }}>{pro.pointsRequired || '2 pts'}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--gris)', textTransform: 'uppercase', fontWeight: 700 }}>Devis</div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {(pro.tags || pro.specialities || ["Rénovation", "Design int."]).slice(0, 3).map((tag, idx) => (
                    <span key={idx} style={{ background: 'var(--gris-f)', border: '1px solid var(--gris-b)', color: 'var(--gris)', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 2 Boutons : {t('architects.quote_btn')} & {t('architects.profile_btn')} */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => setContactModal(pro)}
                    style={{
                      flex: 1.2,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                      color: '#0F0D09',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 3px 10px rgba(212,175,55,0.25)'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <span>{t('architects.quote_btn')}</span>
                  </button>

                  <button
                    onClick={() => setSelectedProModal(pro)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1.5px solid var(--gris-b)',
                      background: 'var(--gris-f)',
                      color: 'var(--noir)',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span style={{ width: 8, height: 8, background: 'var(--noir)', display: 'inline-block', borderRadius: 2 }} />
                    <span>{t('architects.profile_btn')}</span>
                  </button>
                </div>

              </div>
            </div>
          )))}
        </div>

        {/* MODAL PROFIL DÉTAILLÉ COMPLET DU PROFESSIONNEL (AVEC AVIS & ÉTOILES) */}
        {selectedProModal && (
          <ProProfileDetailModal
            pro={selectedProModal}
            currentUser={user}
            onClose={() => setSelectedProModal(null)}
            onSelectProject={(proj) => {
              setSelectedProModal(null);
              setSelectedProjectModal(proj);
            }}
            onRequestQuote={(proObj, projectObj) => {
              setSelectedProModal(null);
              setQuoteProjectModal(projectObj || null);
              setContactModal(proObj);
            }}
            onOrderEscrow={(escrowObj) => {
              setSelectedProModal(null);
              setEscrowModalData(escrowObj);
            }}
          />
        )}

        {/* MODAL CONTACT & DEVIS STRUCTURÉ PRO */}
        {contactModal && (
          <ProQuoteRequestModal
            proData={contactModal}
            projectData={quoteProjectModal}
            onClose={() => {
              setContactModal(null);
              setQuoteProjectModal(null);
            }}
            onSubmitSuccess={(quote) => {
              console.log('Devis enregistré :', quote);
            }}
          />
        )}

        {/* MODAL DÉTAILS D'UN CHANTIER / RÉALISATION HAUT DE GAMME */}
        {selectedProjectModal && (
          <ProProjectDetailModal
            project={selectedProjectModal}
            currentUser={user}
            onClose={() => setSelectedProjectModal(null)}
            onOrderEscrow={(p) => {
              setSelectedProjectModal(null);
              const rawBudget = parseInt(String(p.budget || '').replace(/[^0-9]/g, ''), 10);
              const depositAmount = rawBudget && rawBudget > 0 ? (rawBudget <= 100000 ? rawBudget : Math.round(rawBudget * 0.5)) : 50000;
              setEscrowModalData({
                service: p.title,
                acompte: depositAmount,
                totalBudget: rawBudget || depositAmount,
                pro: p.author?.name || 'Artisan Certifié'
              });
            }}
            onRequestQuote={(p) => {
              setSelectedProjectModal(null);
              setQuoteProjectModal(p);
              const proTarget = p.author || {
                id: p.professional,
                name: p.author_name || 'Artisan Piolo',
                phone: p.phone || '+237699001122'
              };
              setContactModal(proTarget);
            }}
          />
        )}

        {/* MODAL CALCULATEUR DE BUDGET EXPRESS */}
        {calculatorOpen && (
          <div className="pro-modal-backdrop">
            <div className="pro-modal-card" style={{ maxWidth: 640 }}>
              <ProBudgetCalculator
                onClose={() => setCalculatorOpen(false)}
                onOpenDevis={(d) => {
                  setCalculatorOpen(false);
                  alert(`✓ Votre simulation pour "${d.service}" (${d.minPrice.toLocaleString('fr-FR')} - ${d.maxPrice.toLocaleString('fr-FR')} FCFA) a été transmise aux artisans certifiés !`);
                }}
                onOpenEscrow={(d) => {
                  setCalculatorOpen(false);
                  setEscrowModalData(d);
                }}
              />
            </div>
          </div>
        )}

        {/* MODAL ACOMPTE SÉCURISÉ PIOLO ESCROW */}
        {escrowModalData && (
          <ProEscrowModal
            projectData={escrowModalData}
            onClose={() => setEscrowModalData(null)}
            onSuccess={() => {
              alert('✓ Acompte sécurisé validé avec succès par Piolo Protec !');
              setEscrowModalData(null);
            }}
          />
        )}

        {/* MODAL MODE DÉCOUVERTE VIDÉOS IMMERSIF (REELS PRO) */}
        {discoveryVideoOpen && (
          <ProDiscoveryVideoModal
            projects={projectsList}
            onClose={() => setDiscoveryVideoOpen(false)}
            onSelectProject={(proj) => {
              setDiscoveryVideoOpen(false);
              setSelectedProjectModal(proj);
            }}
            onRequestQuote={(proj) => {
              setDiscoveryVideoOpen(false);
              setContactModal(proj.author || { name: 'Artisan Piolo', phone: '+237699001122' });
            }}
          />
        )}

      </div>

      <MobileBottomNav />
    </div>
  );
}
