// src/pages/admin/SuperAdminDashboard.jsx — Centre de Contrôle Super-Admin Piolo
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import PioloLoader from '../../components/PioloLoader';
import api from '../../services/api';
import { getMediaUrl } from '../../utils/media';
import Glyph from './components/Glyph';
import ConfigPreviewModal from './components/ConfigPreviewModal';
import ConfigHistoryModal from './components/ConfigHistoryModal';
import FeatureFlagSettings from './sections/FeatureFlagSettings';
import IntegrationSettings from './sections/IntegrationSettings';
import NotificationSettings from './sections/NotificationSettings';
import RealEstateSettings from './sections/RealEstateSettings';
import FinancialSettings from './sections/FinancialSettings';
import RolesSettings from './sections/RolesSettings';
import './AdminDashboard.css';

const USERS_PAGE_SIZE = 8;
const AUDIT_PAGE_SIZE = 10;
const PROPERTIES_PAGE_SIZE = 6;

const tabIcons = {
  dossiers: 'M6 3h9l3 3v15H6zM9 11h6M9 15h6M9 7h3',
  traffic: 'M4 18V10M10 18V6M16 18v-4M22 18V3',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87',
  properties: 'M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6',
  discovery: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
  finance: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  broadcast: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  theme: 'M12 3v18M3 12h18',
};

const kycIcons = {
  clock: 'M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  alert: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  pin: 'M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',
  building: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1m4 0h1m-5 4h1m4 0h1m-5 4h1m4 0h1',
  idCard: 'M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm4 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0h4m-4 4h4M4 16h6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-3-2v4M8 2v4M3 10h18',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  grid: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  table: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
  whatsapp: 'M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z',
  bed: 'M2 4v16M2 8h20v12M2 13h20M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2',
  bath: 'M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1zm2-4a2 2 0 1 1 4 0v4H6V8z',
  surface: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  archive: 'M21 8v13H3V8M1 3h22v5H1zM10 12h4',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2l8 5 8-5',
  money: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  broadcast: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  chart: 'M18 20V10M12 20V4M6 20v-6',
};

function Icon({ path, size = 16 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}
function KycIcon({ name, size = 15, style = {} }) {
  const isFilled = ['star', 'grid', 'table', 'whatsapp'].includes(name);
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={isFilled ? 'currentColor' : 'none'} stroke={isFilled ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={kycIcons[name] || kycIcons.alert} />
    </svg>
  );
}
function TabIcon({ name }) { return <Icon path={tabIcons[name]} />; }
function Seal({ tone, children }) { return <span className={`seal seal--${tone}`}>{children}</span>; }

function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Page précédente">‹</button>
      {nums.map((n, i) => n === '…'
        ? <span key={`e${i}`} style={{ color: 'var(--ink-faint)', padding: '0 4px' }}>…</span>
        : <button key={n} className={`page-btn ${n === page ? 'page-btn--active' : ''}`} onClick={() => onChange(n)}>{n}</button>
      )}
      <button className="page-btn" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Page suivante">›</button>
    </div>
  );
}

function Toggle({ checked, onChange, danger }) {
  return (
    <div className="toggle">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <div className={`toggle__track ${checked && danger ? 'toggle__track--on' : ''}`} onClick={() => onChange(!checked)}>
        <div className={`toggle__thumb ${checked ? 'toggle__thumb--on' : ''}`} />
      </div>
    </div>
  );
}

const CONFIG_CATEGORIES = [
  {
    category: '1. Identité & Vitrine',
    items: [
      { id: 'branding', icon: 'image', label: 'Branding & Logos' },
      { id: 'typo', icon: 'type', label: 'Typographie & Polices' },
      { id: 'colors', icon: 'palette', label: 'Palette & Design Tokens' },
      { id: 'cms', icon: 'file-text', label: 'Textes d’Accueil & CMS' },
    ],
  },
  {
    category: '2. Moteur Immobilier',
    items: [
      { id: 'realestate', icon: 'home', label: 'Règles Immobilières & Visites' },
      { id: 'features', icon: 'flag', label: 'Modules & Feature Flags' },
    ],
  },
  {
    category: '3. Finances & Monétisation',
    items: [
      { id: 'financial', icon: 'dollar', label: 'Tarification, Boosts & MoMo' },
      { id: 'notifications', icon: 'bell', label: 'Notifications & Triggers' },
    ],
  },
  {
    category: '4. Gouvernance & Sécurité',
    items: [
      { id: 'roles', icon: 'users', label: 'Permissions & Rôles Admin' },
      { id: 'integrations', icon: 'lock', label: 'Sécurité des Intégrations' },
      { id: 'settings', icon: 'settings', label: 'Points & Mode Maintenance' },
    ],
  },
];

const FONT_HEADING_OPTIONS = [
  { value: 'Poppins', label: 'Poppins — Moderne & arrondi' },
  { value: 'Montserrat', label: 'Montserrat — Structuré & premium' },
  { value: 'Outfit', label: 'Outfit — Luxe & géométrique' },
  { value: 'Playfair Display', label: 'Playfair Display — Prestige & sérif' },
  { value: 'Inter', label: 'Inter — Épuré & utilitaire' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans — Tech' },
];
const FONT_BODY_OPTIONS = [
  { value: 'Inter', label: "Inter — Standard d'excellence" },
  { value: 'DM Sans', label: 'DM Sans — Fluide' },
  { value: 'Roboto', label: 'Roboto — Classique' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Open Sans', label: 'Open Sans' },
];
const COLOR_SWATCHES = [
  { key: 'primary_gold', label: 'Or principal', def: '#D4AF37', hint: 'Couleur principale des boutons et accents' },
  { key: 'gold_light', label: 'Or lumineux', def: '#F6D365', hint: 'Dégradé clair, survols et gradients' },
  { key: 'dark_bg', label: 'Fond sombre (dark)', def: '#070503', hint: 'Arrière-plan en mode sombre' },
  { key: 'card_bg_dark', label: 'Cartes sombres', def: '#181510', hint: 'Fond des cartes en mode sombre' },
];
const RADIUS_PRESETS = [4, 10, 14, 20, 28];

export default function SuperAdminDashboard() {
  useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('dossiers');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [dossierToReject, setDossierToReject] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  // Modals de configuration
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [originalTheme, setOriginalTheme] = useState({});

  // ── Recherche / filtres / tri (frontend uniquement pour l'instant) ──
  const [dossierSearch, setDossierSearch] = useState('');
  const [dossierStatusFilter, setDossierStatusFilter] = useState('ALL');
  const [dossierViewMode, setDossierViewMode] = useState('grid'); // 'grid' | 'table'

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);

  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditSortDir, setAuditSortDir] = useState('desc');
  const [auditPage, setAuditPage] = useState(1);

  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('ALL');
  const [propertyViewMode, setPropertyViewMode] = useState('grid'); // 'grid' | 'table'
  const [propertyPage, setPropertyPage] = useState(1);
  const [selectedProperties, setSelectedProperties] = useState(new Set());
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [userForm, setUserForm] = useState({
    first_name: '', last_name: '', email: '', password: '', phone: '', city: '',
    role: 'LOCATAIRE', status: 'ACTIVE',
  });

  // ── Lightbox documents KYC ──
  const [lightbox, setLightbox] = useState(null); // { docs: [{src,label}], index }

  // ── Confirmation générique pour actions sensibles ──
  const [confirmState, setConfirmState] = useState(null); // { message, onConfirm }

  // ── Theme Form State ──
  const [themeForm, setThemeForm] = useState({
    primary_gold: '#D4AF37',
    gold_light: '#F6D365',
    gold_dark: '#E8C84A',
    dark_bg: '#070503',
    card_bg_dark: '#181510',
    border_radius: 14,
  });

  // ── Mode Découverte & Reels State ──
  const [discoveryFilter, setDiscoveryFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED' | 'FEATURED'
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [discoveryPage, setDiscoveryPage] = useState(1);
  const [discoveryModalVideo, setDiscoveryModalVideo] = useState(null);

  // ── Finances & Revenus State ──
  const [financeFilter, setFinanceFilter] = useState('ALL'); // 'ALL' | 'SUBSCRIPTION' | 'CONCIERGE' | 'BOOST'
  const [financeMethodFilter, setFinanceMethodFilter] = useState('ALL'); // 'ALL' | 'OM' | 'MOMO' | 'CARD' | 'POINTS'
  const [financeSearch, setFinanceSearch] = useState('');
  const [financePage, setFinancePage] = useState(1);

  // ── Diffusion d'Alertes (Broadcast) State ──
  const [broadcastForm, setBroadcastForm] = useState({
    target_audience: 'ALL',
    title: '',
    body: '',
    priority: 'NORMAL',
    kind: 'SYSTEM',
    url: '',
  });
  const [broadcastSending, setBroadcastSending] = useState(false);

  const fetchAdminData = async () => {
    try {
      const { data: json } = await api.get('/auth/admin-dashboard/');
      setData(json);
      setLastSynced(new Date());
      if (json.theme) {
        setThemeForm(json.theme);
        setOriginalTheme(json.theme);
      }
    } catch (err) {
      const detail = err.response?.data?.error || err.response?.data?.detail;
      setMessage({ type: 'error', text: err.response?.status === 403 ? 'Accès administrateur refusé.' : (detail || `Impossible de charger les données administrateur${err.response?.status ? ` (${err.response.status})` : ''}.`) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (['dossiers', 'traffic', 'users', 'properties', 'discovery', 'finance', 'broadcast', 'theme'].includes(tab)) setActiveTab(tab);
  }, [location.search]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  const askConfirm = (msg, onConfirm) => setConfirmState({ message: msg, onConfirm });

  const handleApproveDossier = async (dossierId, level = 2) => {
    setProcessingId(dossierId);
    try {
      const { data: json } = await api.post(`/auth/admin-dossier/${dossierId}/approve/`, { verification_level: level });
      setMessage({ type: 'success', text: json.message || 'Dossier approuvé !' });
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la validation.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDossierSubmit = async () => {
    if (!rejectReason.trim()) { alert("Veuillez saisir un motif de rejet."); return; }
    setProcessingId(dossierToReject);
    try {
      const { data: json } = await api.post(`/auth/admin-dossier/${dossierToReject}/reject/`, { reason: rejectReason });
      setMessage({ type: 'success', text: json.message || 'Dossier rejeté.' });
      setRejectionModalOpen(false);
      setRejectReason('');
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur au rejet.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserAction = async (userId, action, payload = {}) => {
    try {
      const { data: json } = await api.post(`/auth/admin-user/${userId}/action/`, { action, ...payload });
      if (json.ok !== false) {
        setMessage({ type: 'success', text: 'Utilisateur mis à jour !' });
        fetchAdminData();
      } else setMessage({ type: 'error', text: json.error || 'Action refusée.' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur réseau pendant la mise à jour.' });
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setUserSaving(true);
    try {
      await api.post('/auth/admin-user/create/', userForm);
      setMessage({ type: 'success', text: 'Le compte a été créé avec succès.' });
      setUserModalOpen(false);
      setUserForm({ first_name: '', last_name: '', email: '', password: '', phone: '', city: '', role: 'LOCATAIRE', status: 'ACTIVE' });
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Impossible de créer ce compte.' });
    } finally {
      setUserSaving(false);
    }
  };

  const handlePropertyModeration = async (propertyId, action) => {
    try {
      await api.post(`/properties/${propertyId}/admin-moderate/`, { action });
      setMessage({ type: 'success', text: action === 'publish' ? 'Annonce publiée.' : action === 'archive' ? 'Annonce archivée.' : 'Annonce remise en brouillon.' });
      fetchAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message || 'Erreur de modération.' });
    }
  };

  const handleBulkModeration = async (action) => {
    const ids = Array.from(selectedProperties);
    for (const id of ids) {
      await handlePropertyModeration(id, action);
    }
    setSelectedProperties(new Set());
  };

  const handleDiscoveryModerate = async (propertyId, action, payload = {}) => {
    try {
      const { data: res } = await api.post(`/properties/${propertyId}/admin-discovery-moderate/`, { action, ...payload });
      setMessage({ type: 'success', text: res.message || 'Modération Découverte appliquée avec succès !' });
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la modération Découverte.' });
    }
  };

  const handleSaveTheme = async (e, customData = null) => {
    if (e) e.preventDefault();
    const payload = customData || themeForm;
    try {
      await api.post('/auth/admin-theme/', payload);
      setMessage({ type: 'success', text: 'Thème et configuration enregistrés et appliqués en direct !' });
      document.documentElement.style.setProperty('--or', payload.primary_gold);
      document.documentElement.style.setProperty('--or-l', payload.gold_light);
      document.documentElement.style.setProperty('--or-d', payload.gold_dark);
      if (payload.dark_bg) document.documentElement.style.setProperty('--noir-b', payload.dark_bg);
      if (customData) setThemeForm(customData);
      fetchAdminData();
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde de la configuration.' });
    }
  };

  const exportAuditCsv = (rows) => {
    const header = ['Date', 'Action', 'Utilisateur', 'Email', 'IP', 'Détails'];
    const lines = rows.map(l => [
      new Date(l.created_at).toLocaleString('fr-FR'),
      l.action, l.user_name, l.email, l.ip_address, (l.details || '').replace(/,/g, ';')
    ].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTransactionsCSV = (rows) => {
    const header = ['ID', 'Type', 'Utilisateur', 'Email', 'Telephone', 'Montant_FCFA', 'Moyen_Paiement', 'Reference', 'Statut', 'Date', 'Details'];
    const lines = rows.map(t => [
      t.id,
      `"${t.type_label || t.type}"`,
      `"${t.user_name || ''}"`,
      `"${t.user_email || ''}"`,
      `"${t.user_phone || ''}"`,
      t.amount,
      `"${t.payment_method_label || t.payment_method}"`,
      `"${t.reference || ''}"`,
      t.status,
      `"${t.created_at}"`,
      `"${(t.details || '').replace(/"/g, '""')}"`
    ].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-financieres-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendBroadcast = async (e) => {
    e?.preventDefault();
    if (!broadcastForm.title.trim()) {
      alert("Veuillez saisir un titre pour l'alerte.");
      return;
    }
    if (!broadcastForm.body.trim()) {
      alert("Veuillez saisir le corps du message.");
      return;
    }

    const audienceLabel = broadcastForm.target_audience === 'ALL'
      ? 'Tous les utilisateurs'
      : broadcastForm.target_audience === 'BAILLEUR'
      ? 'Bailleurs vérifiés'
      : broadcastForm.target_audience === 'LOCATAIRE'
      ? 'Locataires actifs'
      : 'Professionnels & Architectes';

    askConfirm(`Confirmez-vous l'envoi immédiat de cette alerte à l'audience : « ${audienceLabel} » ?`, async () => {
      setBroadcastSending(true);
      try {
        const { data: res } = await api.post('/auth/admin-broadcast-notification/', broadcastForm);
        setMessage({ type: 'success', text: res.message || 'Notification diffusée avec succès !' });
        setBroadcastForm({
          target_audience: 'ALL',
          title: '',
          body: '',
          priority: 'NORMAL',
          kind: 'SYSTEM',
          url: '',
        });
        fetchAdminData();
      } catch (err) {
        const errDetail = err.response?.data?.error || err.response?.data?.detail;
        setMessage({ type: 'error', text: errDetail || "Erreur lors de la diffusion de l'alerte." });
      } finally {
        setBroadcastSending(false);
      }
    });
  };

  const openLightbox = (dossier, startKey) => {
    const docs = [
      dossier.cni_recto && { src: getMediaUrl(dossier.cni_recto), label: 'Pièce d’identité — Recto' },
      dossier.cni_verso && { src: getMediaUrl(dossier.cni_verso), label: 'Pièce d’identité — Verso' },
      dossier.selfie && { src: getMediaUrl(dossier.selfie), label: 'Photo de conformité (Selfie)' },
    ].filter(Boolean);
    if (!docs.length) return;
    const startIndex = Math.max(0, docs.findIndex(d => d.label.toLowerCase().includes(startKey)));
    setLightbox({ docs, index: startIndex });
  };

  const resetThemeColors = () => {
    const resetTheme = { ...themeForm, primary_gold: '#D4AF37', gold_light: '#F6D365', gold_dark: '#E8C84A', dark_bg: '#070503', card_bg_dark: '#181510', border_radius: 14 };
    handleSaveTheme(null, resetTheme);
  };

  const scrollToConfigSection = (id) => {
    document.getElementById(`cfg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <PioloLoader />;

  const kpis = data?.kpis || {};
  const dossiers = data?.dossiers || [];
  const auditLogs = data?.audit_logs || [];
  const users = data?.users || [];
  const properties = data?.properties || [];
  const pendingCount = dossiers.filter(d => d.status === 'PENDING').length;

  const approvedCount = dossiers.filter(d => d.status === 'APPROVED').length;
  const rejectedCount = dossiers.filter(d => d.status === 'REJECTED').length;
  const processedCount = approvedCount + rejectedCount;
  const certificationRate = processedCount > 0 ? Math.round((approvedCount / processedCount) * 100) : 0;

  const isUrgent = (d) => {
    if (!d.created_at || d.status !== 'PENDING') return false;
    const hours = (Date.now() - new Date(d.created_at).getTime()) / 36e5;
    return hours >= 48;
  };

  const urgentCount = dossiers.filter(d => isUrgent(d)).length;

  const filteredDossiers = dossiers.filter(d => {
    let matchStatus = true;
    if (dossierStatusFilter === 'URGENT') {
      matchStatus = isUrgent(d);
    } else if (dossierStatusFilter !== 'ALL') {
      matchStatus = d.status === dossierStatusFilter;
    }
    const q = dossierSearch.trim().toLowerCase();
    const matchSearch = !q ||
      d.user_name?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.user_email?.toLowerCase().includes(q) ||
      (d.user_phone && String(d.user_phone).includes(q)) ||
      (d.document_number && String(d.document_number).toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const filteredUsers = users.filter(u => {
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const q = userSearch.trim().toLowerCase();
    const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });
  const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PAGE_SIZE, userPage * USERS_PAGE_SIZE);

  const auditActionTypes = Array.from(new Set(auditLogs.map(l => l.action)));
  const filteredAudit = auditLogs
    .filter(l => {
      const matchAction = auditActionFilter === 'ALL' || l.action === auditActionFilter;
      const q = auditSearch.trim().toLowerCase();
      const matchSearch = !q || l.user_name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.ip_address?.toLowerCase().includes(q);
      return matchAction && matchSearch;
    })
    .sort((a, b) => auditSortDir === 'desc'
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at));
  const pagedAudit = filteredAudit.slice((auditPage - 1) * AUDIT_PAGE_SIZE, auditPage * AUDIT_PAGE_SIZE);

  const publishedPropsCount = properties.filter(p => p.is_published).length;
  const draftPropsCount = properties.filter(p => !p.is_published).length;
  const featuredPropsCount = properties.filter(p => p.is_featured || p.is_boosted).length;

  const filteredProperties = properties.filter(p => {
    let matchStatus = true;
    if (propertyStatusFilter === 'PUBLISHED') matchStatus = p.is_published;
    else if (propertyStatusFilter === 'DRAFT') matchStatus = !p.is_published;
    else if (propertyStatusFilter === 'FEATURED') matchStatus = Boolean(p.is_featured || p.is_boosted);

    const q = propertySearch.trim().toLowerCase();
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.neighborhood?.toLowerCase().includes(q) ||
      p.owner_name?.toLowerCase().includes(q) ||
      p.owner_email?.toLowerCase().includes(q) ||
      p.property_type?.toLowerCase().includes(q) ||
      p.transaction_type?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  const pagedProperties = filteredProperties.slice((propertyPage - 1) * PROPERTIES_PAGE_SIZE, propertyPage * PROPERTIES_PAGE_SIZE);

  const togglePropertySelection = (id) => {
    setSelectedProperties(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllPropertiesSelection = () => {
    if (selectedProperties.size === pagedProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(pagedProperties.map(p => p.id)));
    }
  };

  // ── Filtrage & Pagination Mode Découverte (Reels) ──
  const discoveryReelsList = data?.discovery_reels || [];
  const filteredDiscoveryReels = discoveryReelsList.filter(r => {
    if (discoveryFilter === 'ACTIVE' && (!r.is_in_discovery || !r.is_published)) return false;
    if (discoveryFilter === 'BLOCKED' && (r.is_in_discovery && r.is_published)) return false;
    if (discoveryFilter === 'FEATURED' && !r.is_discovery_featured) return false;
    if (discoverySearch.trim()) {
      const q = discoverySearch.toLowerCase();
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchCity = (r.city || '').toLowerCase().includes(q);
      const matchNeigh = (r.neighborhood || '').toLowerCase().includes(q);
      const matchOwner = (r.owner_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchNeigh && !matchOwner) return false;
    }
    return true;
  });
  const pagedDiscoveryReels = filteredDiscoveryReels.slice((discoveryPage - 1) * 6, discoveryPage * 6);

  // ── Filtrage & Pagination Finances & Revenus ──
  const financials = data?.financials || {};
  const broadcastHistory = data?.broadcast_history || [];
  const rawTransactions = financials.transactions || [];

  const filteredTransactions = rawTransactions.filter(tx => {
    if (financeFilter !== 'ALL' && tx.type !== financeFilter) return false;
    if (financeMethodFilter !== 'ALL' && tx.payment_method !== financeMethodFilter) return false;
    if (financeSearch.trim()) {
      const q = financeSearch.toLowerCase();
      const matchName = (tx.user_name || '').toLowerCase().includes(q);
      const matchEmail = (tx.user_email || '').toLowerCase().includes(q);
      const matchPhone = (tx.user_phone || '').toLowerCase().includes(q);
      const matchRef = (tx.reference || '').toLowerCase().includes(q);
      const matchType = (tx.type_label || '').toLowerCase().includes(q);
      const matchDet = (tx.details || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchRef && !matchType && !matchDet) return false;
    }
    return true;
  });
  const pagedTransactions = filteredTransactions.slice((financePage - 1) * 8, financePage * 8);

  return (
    <div className="admin-workspace" style={{ display: 'flex', alignItems: 'stretch', width: '100%', minHeight: '100vh' }}>
      <AdminSidebar counts={{ pending: pendingCount, users: users.length, properties: properties.length, reels: discoveryReelsList.length, audit: auditLogs.length, transactions: rawTransactions.length }} />

      <main className="admin-main" style={{ flex: '1 1 auto', minWidth: 0, margin: 0, padding: '30px clamp(18px, 3vw, 42px) 60px', overflow: 'visible' }}>

        {/* Toasts */}
        {message && (
          <div className="toast-stack">
            <div className={`admin-toast admin-toast--${message.type}`}>
              <div className="admin-toast__body">
                <span className="admin-toast__dot" />
                <span>{message.text}</span>
              </div>
              <button onClick={() => setMessage(null)} aria-label="Fermer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 4 }}>
                <KycIcon name="x" size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Header + carte de performance */}
        <div className="admin-top-row">
          <header className="admin-header">
            <div className="admin-header__row">
              <div>
                <p className="admin-header__eyebrow">Registre de Certification Piolo</p>
                <h1 className="disp">Centre de Contrôle Super-Admin</h1>
                <p className="admin-header__desc">Supervision en temps réel, modération des bailleurs, trafic live et personnalisation du thème.</p>
                <div className="status-live">
                  <span className="status-live__dot" />
                  Système live · 100% opérationnel
                </div>
              </div>

              <div className="admin-header__actions">
                <button className="btn-bell" onClick={() => setActiveTab('dossiers')} aria-label="Dossiers en attente">
                  <Icon path="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={18} />
                  {pendingCount > 0 && <span className="btn-bell__badge">{pendingCount}</span>}
                </button>
                <button onClick={fetchAdminData} className="btn-refresh">
                  <Icon path="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" size={15} />
                  <span>Rafraîchir</span>
                </button>
              </div>
            </div>

            <div className="admin-sync">
              <span className="admin-sync__dot" />
              Synchronisation automatique active
              {lastSynced && <span>· dernière mise à jour {lastSynced.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          </header>

          <div className="performance-card" style={{ '--pct': certificationRate }}>
            <div className="performance-card__ring">
              <span className="performance-card__pct disp">{certificationRate}%</span>
            </div>
            <p className="performance-card__title disp">Taux de certification</p>
            <p className="performance-card__desc">
              {processedCount > 0
                ? `${approvedCount} approuvé(s) sur ${processedCount} dossier(s) traité(s). Continuez à traiter les dossiers en attente pour maintenir ce taux.`
                : "Aucun dossier traité pour l'instant. Les premières décisions détermineront ce taux."}
            </p>
          </div>
        </div>

        {/* KPI grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card__label">
              Dossiers en attente
              <span className="kpi-card__icon"><Icon path={tabIcons.dossiers} size={15} /></span>
            </div>
            <div className={`kpi-card__value disp ${pendingCount > 0 ? 'kpi-card__value--alert' : ''}`}>{pendingCount}</div>
            <div className="kpi-card__sub">Dossiers KYC à certifier</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__label">
              Total utilisateurs
              <span className="kpi-card__icon"><Icon path={tabIcons.users} size={15} /></span>
            </div>
            <div className="kpi-card__value disp">{kpis.total_users || 0}</div>
            <div className="kpi-card__sub">{kpis.locataires_count || 0} locataires · {kpis.bailleurs_count || 0} bailleurs</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__label">
              Annonces publiées
              <span className="kpi-card__icon"><Icon path={tabIcons.properties} size={15} /></span>
            </div>
            <div className="kpi-card__value disp">{kpis.published_properties || 0}</div>
            <div className="kpi-card__sub">sur {kpis.total_properties || 0} annonces totales</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card__label">
              Trafic & logins live
              <span className="kpi-card__icon"><Icon path={tabIcons.traffic} size={15} /></span>
            </div>
            <div className="kpi-card__value disp kpi-card__value--positive">{auditLogs.length}</div>
            <div className="kpi-card__sub">Événements récents interceptés</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="tab-nav">
          {[
            { id: 'dossiers', label: `Dossiers bailleurs (${pendingCount})` },
            { id: 'traffic', label: `Journal d'activité (${auditLogs.length})` },
            { id: 'users', label: `Utilisateurs (${users.length})` },
            { id: 'properties', label: `Annonces (${properties.length})` },
            { id: 'discovery', label: `Mode Découverte (${discoveryReelsList.length})` },
            { id: 'finance', label: `Finances & Revenus (${rawTransactions.length})` },
            { id: 'broadcast', label: `Diffusion d'Alertes (${broadcastHistory.length})` },
            { id: 'theme', label: 'Apparence' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}>
              <TabIcon name={tab.id} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── TAB 1: DOSSIERS BAILLEURS ── */}
        {activeTab === 'dossiers' && (
          <div>
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <h2 className="section-title disp" style={{ fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                  Certification &amp; Vérification des Bailleurs (KYC)
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(212,175,55,0.15)', color: 'var(--gold-deep)', padding: '2px 10px', borderRadius: 20 }}>
                    {pendingCount} en attente
                  </span>
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                  Auditez les pièces d'identité officielles, contrôlez la conformité faciale et attribuez les badges certifiés Piolo.
                </p>
              </div>

              {/* View toggle */}
              <div className="kyc-view-toggle">
                <button
                  type="button"
                  onClick={() => setDossierViewMode('grid')}
                  className={`kyc-view-btn ${dossierViewMode === 'grid' ? 'kyc-view-btn--active' : ''}`}
                  title="Vue Grille / Cartes interactives"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg>
                  Grille
                </button>
                <button
                  type="button"
                  onClick={() => setDossierViewMode('table')}
                  className={`kyc-view-btn ${dossierViewMode === 'table' ? 'kyc-view-btn--active' : ''}`}
                  title="Vue Tableau d'audit rapide"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                  Tableau
                </button>
              </div>
            </div>

            {/* Quick Status Pills */}
            <div className="kyc-meta-bar">
              <div className="kyc-quick-pills">
                {[
                  { id: 'ALL', label: 'Tous les dossiers', count: dossiers.length, icon: null },
                  { id: 'PENDING', label: 'En attente', count: pendingCount, icon: 'clock' },
                  { id: 'URGENT', label: 'Urgent (> 48h)', count: urgentCount, isUrgent: true, icon: 'alert' },
                  { id: 'APPROVED', label: 'Certifiés V2/V3', count: approvedCount, icon: 'check' },
                  { id: 'REJECTED', label: 'Rejetés', count: rejectedCount, icon: 'x' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDossierStatusFilter(p.id)}
                    className={`kyc-pill-btn ${dossierStatusFilter === p.id ? 'kyc-pill-btn--active' : ''}`}
                    style={p.isUrgent && p.count > 0 && dossierStatusFilter !== p.id ? { borderColor: 'rgba(239,68,68,0.4)', color: 'var(--red)', background: 'rgba(239,68,68,0.06)' } : {}}
                  >
                    {p.icon && <KycIcon name={p.icon} size={13} />}
                    <span>{p.label}</span>
                    <span className="kyc-pill-count">{p.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar">
              <div className="search-field">
                <Icon path="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" size={16} />
                <input placeholder="Rechercher par nom, ville, email, tél, numéro de CNI…" value={dossierSearch} onChange={e => setDossierSearch(e.target.value)} />
              </div>
              {dossierSearch && (
                <button onClick={() => setDossierSearch('')} className="btn btn-ghost" style={{ padding: '10px 14px', fontSize: 12 }}>
                  Effacer la recherche
                </button>
              )}
            </div>

            {filteredDossiers.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px', background: '#FFFFFF', borderRadius: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(212,175,55,0.12)', color: 'var(--gold-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={26} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Aucun dossier trouvé</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {dossiers.length === 0 ? 'Aucun bailleur n’a soumis de pièces justificatives pour le moment.' : 'Aucun dossier ne correspond à vos critères de recherche actuels.'}
                </p>
              </div>
            ) : dossierViewMode === 'grid' ? (
              <div className="dossier-grid">
                {filteredDossiers.map(dossier => {
                  const isPending = dossier.status === 'PENDING';
                  const isApproved = dossier.status === 'APPROVED';
                  const isRejected = dossier.status === 'REJECTED';
                  const urgent = isUrgent(dossier);
                  const initials = (dossier.user_name || 'B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const phoneFormatted = dossier.user_phone ? String(dossier.user_phone).replace(/\s+/g, '') : null;
                  const waLink = phoneFormatted ? `https://wa.me/${phoneFormatted.startsWith('+') ? phoneFormatted.slice(1) : (phoneFormatted.startsWith('237') ? phoneFormatted : `237${phoneFormatted}`)}?text=${encodeURIComponent(`Bonjour ${dossier.user_name || 'M./Mme'}, nous traitons actuellement votre dossier de certification bailleur sur Piolo.`)}` : null;

                  return (
                    <div key={dossier.id} className={`dossier-card ${isPending ? 'dossier-card--pending' : ''}`}>
                      {/* Card Header */}
                      <div className="dossier-card__header">
                        <div className="dossier-card__user-box">
                          <div className="dossier-card__avatar">
                            {initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 className="dossier-card__name" title={dossier.user_name}>{dossier.user_name}</h3>
                            <div className="dossier-card__submeta">
                              <span className="reg-mono" style={{ fontSize: 11 }}>ID #{dossier.id}</span>
                              <span>•</span>
                              <span>{dossier.city || 'Cameroun'}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <Seal tone={isPending ? 'pending' : isApproved ? 'approved' : 'rejected'}>
                            <KycIcon name={isPending ? 'clock' : isApproved ? 'check' : 'x'} size={11} style={{ marginRight: 3 }} />
                            <span>{isPending ? 'En attente' : isApproved ? 'Vérifié' : 'Rejeté'}</span>
                          </Seal>
                          {urgent && (
                            <Seal tone="urgent">
                              <KycIcon name="alert" size={10} style={{ marginRight: 3 }} />
                              <span>Urgent &gt; 48h</span>
                            </Seal>
                          )}
                        </div>
                      </div>

                      {/* Quick Contact Links */}
                      <div className="dossier-card__contact-row">
                        {waLink && (
                          <a href={waLink} target="_blank" rel="noreferrer" className="contact-pill-link contact-pill-link--whatsapp" title="Ouvrir WhatsApp direct">
                            <KycIcon name="whatsapp" size={12} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {phoneFormatted && (
                          <a href={`tel:${phoneFormatted}`} className="contact-pill-link contact-pill-link--phone" title="Appeler direct">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span>{dossier.user_phone}</span>
                          </a>
                        )}
                        {dossier.user_email && (
                          <a href={`mailto:${dossier.user_email}`} className="contact-pill-link contact-pill-link--email" title={dossier.user_email}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <span>Email</span>
                          </a>
                        )}
                      </div>

                      {/* Fact Matrix */}
                      <div className="dossier-facts-grid">
                        <div className="fact-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <KycIcon name="pin" size={11} style={{ color: 'var(--gold-deep)' }} />
                            <span className="fact-item__label">Localisation</span>
                          </div>
                          <span className="fact-item__val" title={`${dossier.city} · ${dossier.neighborhoods || 'Centre'}`}>
                            {dossier.city || 'Non spécifié'} ({dossier.neighborhoods || 'Bastos'})
                          </span>
                        </div>
                        <div className="fact-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <KycIcon name="building" size={11} style={{ color: 'var(--gold-deep)' }} />
                            <span className="fact-item__label">Biens Déclarés</span>
                          </div>
                          <span className="fact-item__val">
                            {dossier.property_count || 1} bien(s) · {dossier.property_types || 'Appartements'}
                          </span>
                        </div>
                        <div className="fact-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <KycIcon name="idCard" size={11} style={{ color: 'var(--gold-deep)' }} />
                            <span className="fact-item__label">Pièce Officielle</span>
                          </div>
                          <span className="fact-item__val" title={`${dossier.document_type || 'CNI'} N° ${dossier.document_number || 'N/A'}`}>
                            {dossier.document_type || 'CNI'} · N° {dossier.document_number || '—'}
                          </span>
                        </div>
                        <div className="fact-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <KycIcon name="shield" size={11} style={{ color: isApproved ? 'var(--green)' : 'var(--gold-deep)' }} />
                            <span className="fact-item__label">Certification</span>
                          </div>
                          <span className="fact-item__val" style={{ color: isApproved ? 'var(--green)' : 'var(--gold-deep)' }}>
                            {isApproved ? (dossier.verification_level === 3 ? 'Premium V3' : 'Vérifié V2') : 'Niveau 1 (Initial)'}
                          </span>
                        </div>
                      </div>

                      {dossier.description && (
                        <div className="dossier-quote-note">
                          "{dossier.description}"
                        </div>
                      )}

                      {/* Document Gallery (Recto / Verso / Selfie) */}
                      <div className="doc-inspect-section">
                        <div className="doc-inspect-header">
                          <span className="doc-inspect-title">Documents KYC à auditer</span>
                          <span style={{ fontSize: 11, color: 'var(--gold-deep)', fontWeight: 600 }}>Inspection HD</span>
                        </div>
                        <div className="doc-inspect-grid">
                          {/* Recto */}
                          {dossier.cni_recto ? (
                            <div className="doc-card-thumb" onClick={() => openLightbox(dossier, 'recto')} title="Agrandir la pièce (Recto)">
                              <img src={getMediaUrl(dossier.cni_recto)} alt="CNI Recto" loading="lazy" decoding="async" />
                              <div className="doc-card-thumb__overlay">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                              </div>
                              <div className="doc-card-thumb__caption">Recto</div>
                            </div>
                          ) : (
                            <div className="doc-card-thumb--empty">
                              <KycIcon name="idCard" size={16} />
                              <span>Recto absent</span>
                            </div>
                          )}

                          {/* Verso */}
                          {dossier.cni_verso ? (
                            <div className="doc-card-thumb" onClick={() => openLightbox(dossier, 'verso')} title="Agrandir la pièce (Verso)">
                              <img src={getMediaUrl(dossier.cni_verso)} alt="CNI Verso" loading="lazy" decoding="async" />
                              <div className="doc-card-thumb__overlay">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                              </div>
                              <div className="doc-card-thumb__caption">Verso</div>
                            </div>
                          ) : (
                            <div className="doc-card-thumb--empty">
                              <KycIcon name="idCard" size={16} />
                              <span>Verso absent</span>
                            </div>
                          )}

                          {/* Selfie */}
                          {dossier.selfie ? (
                            <div className="doc-card-thumb" onClick={() => openLightbox(dossier, 'selfie')} title="Agrandir le selfie de conformité">
                              <img src={getMediaUrl(dossier.selfie)} alt="Selfie" loading="lazy" decoding="async" />
                              <div className="doc-card-thumb__overlay">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                              </div>
                              <div className="doc-card-thumb__caption">Selfie</div>
                            </div>
                          ) : (
                            <div className="doc-card-thumb--empty">
                              <KycIcon name="user" size={16} />
                              <span>Selfie absent</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="dossier-actions">
                        <button
                          disabled={processingId === dossier.id}
                          onClick={() => handleApproveDossier(dossier.id, 2)}
                          className="btn btn-gold"
                          title="Valider et accorder le badge de vérification"
                        >
                          <KycIcon name="check" size={13} />
                          <span>{processingId === dossier.id ? 'Validation…' : 'Valider V2'}</span>
                        </button>
                        <button
                          disabled={processingId === dossier.id}
                          onClick={() => handleApproveDossier(dossier.id, 3)}
                          className="btn btn-gold-outline"
                          title="Accorder le statut Élite Premium V3"
                        >
                          <KycIcon name="star" size={13} />
                          <span>Premium V3</span>
                        </button>
                        <button
                          disabled={processingId === dossier.id}
                          onClick={() => { setDossierToReject(dossier.id); setRejectionModalOpen(true); }}
                          className="btn btn-danger-ghost"
                          title="Rejeter avec notification au bailleur"
                        >
                          <KycIcon name="x" size={13} />
                          <span>Rejeter</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Bailleur</th>
                      <th>Localisation &amp; Biens</th>
                      <th>Pièce d'identité</th>
                      <th>Documents KYC</th>
                      <th>Statut</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDossiers.map(dossier => {
                      const isPending = dossier.status === 'PENDING';
                      const isApproved = dossier.status === 'APPROVED';
                      const urgent = isUrgent(dossier);
                      const initials = (dossier.user_name || 'B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                      return (
                        <tr key={dossier.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{dossier.user_name}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{dossier.user_email} · {dossier.user_phone || 'Pas de tél'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{dossier.city} ({dossier.neighborhoods || 'Bastos'})</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{dossier.property_count} bien(s) • {dossier.property_types}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{dossier.document_type || 'CNI'}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'IBM Plex Mono' }}>N° {dossier.document_number || '—'}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {dossier.cni_recto && (
                                <img src={getMediaUrl(dossier.cni_recto)} alt="Recto" loading="lazy" decoding="async" onClick={() => openLightbox(dossier, 'recto')} style={{ width: 38, height: 26, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--line)' }} title="Recto" />
                              )}
                              {dossier.cni_verso && (
                                <img src={getMediaUrl(dossier.cni_verso)} alt="Verso" loading="lazy" decoding="async" onClick={() => openLightbox(dossier, 'verso')} style={{ width: 38, height: 26, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--line)' }} title="Verso" />
                              )}
                              {dossier.selfie && (
                                <img src={getMediaUrl(dossier.selfie)} alt="Selfie" loading="lazy" decoding="async" onClick={() => openLightbox(dossier, 'selfie')} style={{ width: 38, height: 26, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--line)' }} title="Selfie" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <Seal tone={isPending ? 'pending' : isApproved ? 'approved' : 'rejected'}>
                                {isPending ? 'En attente' : isApproved ? 'Approuvé' : 'Rejeté'}
                              </Seal>
                              {urgent && <Seal tone="urgent">Urgent</Seal>}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button disabled={processingId === dossier.id} onClick={() => handleApproveDossier(dossier.id, 2)} className="btn btn-gold" style={{ padding: '6px 12px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <KycIcon name="check" size={12} />
                                <span>Valider V2</span>
                              </button>
                              <button disabled={processingId === dossier.id} onClick={() => handleApproveDossier(dossier.id, 3)} className="btn btn-gold-outline" style={{ padding: '6px 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <KycIcon name="star" size={12} />
                                <span>Premium V3</span>
                              </button>
                              <button disabled={processingId === dossier.id} onClick={() => { setDossierToReject(dossier.id); setRejectionModalOpen(true); }} className="btn btn-danger-ghost" style={{ padding: '6px 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }} title="Rejeter le dossier">
                                <KycIcon name="x" size={12} />
                                <span>Rejeter</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: TRAFIC & LOGINS LIVE ── */}
        {activeTab === 'traffic' && (
          <div>
            <div className="section-head">
              <h2 className="section-title disp">
                Journal d'audit et connexions
                <span className="section-title__note">Mise à jour auto toutes les 10s</span>
              </h2>
            </div>

            <div className="toolbar">
              <div className="search-field">
                <Icon path="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" size={15} />
                <input placeholder="Rechercher par utilisateur, email, IP…" value={auditSearch} onChange={e => { setAuditSearch(e.target.value); setAuditPage(1); }} />
              </div>
              <select className="filter-select" value={auditActionFilter} onChange={e => { setAuditActionFilter(e.target.value); setAuditPage(1); }}>
                <option value="ALL">Toutes les actions</option>
                {auditActionTypes.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <button className="btn-export" onClick={() => exportAuditCsv(filteredAudit)}>
                <Icon path="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" size={14} />
                Exporter en CSV
              </button>
            </div>

            {filteredAudit.length === 0 ? (
              <div className="empty-state">Aucun événement ne correspond à cette recherche.</div>
            ) : (
              <>
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => setAuditSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
                          Heure & date {auditSortDir === 'desc' ? '↓' : '↑'}
                        </th>
                        <th>Action</th>
                        <th>Utilisateur / email</th>
                        <th>Adresse IP</th>
                        <th>Navigateur / appareil</th>
                        <th>Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedAudit.map((log, idx) => {
                        const isSuccess = log.action.includes('SUCCES') || log.action.includes('APPROVED');
                        const isFailed = log.action.includes('ECHEC') || log.action.includes('REJECTED');
                        const tone = isSuccess ? 'approved' : isFailed ? 'rejected' : 'pending';
                        return (
                          <tr key={log.id || idx}>
                            <td className="cell-time">
                              {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                              <span>{new Date(log.created_at).toLocaleDateString('fr-FR')}</span>
                            </td>
                            <td><Seal tone={tone}>{log.action}</Seal></td>
                            <td>
                              <span className="cell-strong">{log.user_name}</span>
                              <div className="cell-sub">{log.email}</div>
                            </td>
                            <td className="cell-mono">{log.ip_address}</td>
                            <td className="cell-truncate">{log.user_agent}</td>
                            <td>{log.details}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={auditPage} total={filteredAudit.length} pageSize={AUDIT_PAGE_SIZE} onChange={setAuditPage} />
                <div className="pagination-info">{filteredAudit.length} événement(s) · page {auditPage}</div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 3: GESTION DES UTILISATEURS ── */}
        {activeTab === 'users' && (
          <div>
            <div className="section-head">
              <h2 className="section-title disp">Gestion des utilisateurs</h2>
              <button type="button" className="btn btn-gold" onClick={() => setUserModalOpen(true)}>Ajouter un utilisateur</button>
            </div>

            <div className="toolbar">
              <div className="search-field">
                <Icon path="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" size={15} />
                <input placeholder="Rechercher par nom ou email…" value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
              </div>
              <select className="filter-select" value={userRoleFilter} onChange={e => { setUserRoleFilter(e.target.value); setUserPage(1); }}>
                <option value="ALL">Tous les rôles</option>
                <option value="LOCATAIRE">Locataires</option>
                <option value="BAILLEUR">Bailleurs</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="empty-state">Aucun utilisateur ne correspond à cette recherche.</div>
            ) : (
              <>
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Vérification</th>
                        <th>Points</th>
                        <th>Actions admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="cell-strong">{u.full_name}</div>
                            <div className="cell-sub">{u.email} • {u.phone || 'Pas de numéro'}</div>
                          </td>
                          <td>
                            <select value={u.role} onChange={(e) => handleUserAction(u.id, 'role', { role: e.target.value })} className="select-field">
                              <option value="LOCATAIRE">Locataire</option>
                              <option value="BAILLEUR">Bailleur</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                          <td>
                            <select
                              value={u.status}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next === 'BLOCKED') {
                                  askConfirm(`Bloquer le compte de ${u.full_name} ? Il perdra immédiatement l'accès à la plateforme.`, () => handleUserAction(u.id, 'status', { status: next }));
                                } else {
                                  handleUserAction(u.id, 'status', { status: next });
                                }
                              }}
                              className={`select-field ${u.status === 'ACTIVE' ? 'select-field--active' : 'select-field--inactive'}`}
                            >
                              <option value="ACTIVE">Actif</option>
                              <option value="SUSPENDED">Suspendu</option>
                              <option value="BLOCKED">Bloqué</option>
                            </select>
                          </td>
                          <td>
                            <Seal tone="pending">Niveau {u.verification_level} {u.verification_level === 3 ? 'Premium' : u.verification_level === 2 ? 'Certifié' : ''}</Seal>
                          </td>
                          <td><span className="points-pill">{u.points} pts</span></td>
                          <td>
                            <button
                              onClick={() => {
                                const pts = prompt("Attribuer (+) ou déduire (-) des points :", "50");
                                if (pts) handleUserAction(u.id, 'points', { points: parseInt(pts) });
                              }}
                              className="btn-points"
                            >
                              Ajuster les points
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={userPage} total={filteredUsers.length} pageSize={USERS_PAGE_SIZE} onChange={setUserPage} />
                <div className="pagination-info">{filteredUsers.length} utilisateur(s) · page {userPage}</div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 4: MODÉRATION DES ANNONCES ── */}
        {activeTab === 'properties' && (
          <div>
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <h2 className="section-title disp" style={{ fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                  Modération &amp; Gestion des Annonces
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(212,175,55,0.15)', color: 'var(--gold-deep)', padding: '2px 10px', borderRadius: 20 }}>
                    {publishedPropsCount} en ligne · {draftPropsCount} brouillon(s)
                  </span>
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                  Supervisez le parc immobilier, contrôlez la qualité des annonces et publiez ou archivez en direct.
                </p>
              </div>

              {/* Toggle Grille / Tableau */}
              <div className="kyc-view-toggle">
                <button
                  type="button"
                  onClick={() => setPropertyViewMode('grid')}
                  className={`kyc-view-btn ${propertyViewMode === 'grid' ? 'kyc-view-btn--active' : ''}`}
                  title="Vue Grille d'annonces"
                >
                  <KycIcon name="grid" size={14} />
                  <span>Grille</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyViewMode('table')}
                  className={`kyc-view-btn ${propertyViewMode === 'table' ? 'kyc-view-btn--active' : ''}`}
                  title="Vue Tableau de gestion"
                >
                  <KycIcon name="table" size={14} />
                  <span>Tableau</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="kyc-meta-bar">
              <div className="kyc-quick-pills">
                {[
                  { id: 'ALL', label: 'Toutes les annonces', count: properties.length, icon: null },
                  { id: 'PUBLISHED', label: 'En ligne', count: publishedPropsCount, icon: 'check' },
                  { id: 'DRAFT', label: 'Brouillons / En attente', count: draftPropsCount, icon: 'clock' },
                  { id: 'FEATURED', label: 'Vedettes & Boostées', count: featuredPropsCount, icon: 'star' },
                ].map(pill => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => { setPropertyStatusFilter(pill.id); setPropertyPage(1); }}
                    className={`kyc-pill-btn ${propertyStatusFilter === pill.id ? 'kyc-pill-btn--active' : ''}`}
                  >
                    {pill.icon && <KycIcon name={pill.icon} size={13} />}
                    <span>{pill.label}</span>
                    <span className="kyc-pill-count">{pill.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
              <div className="search-field">
                <Icon path="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" size={15} />
                <input
                  placeholder="Rechercher par titre, ville, quartier, propriétaire, prix…"
                  value={propertySearch}
                  onChange={e => { setPropertySearch(e.target.value); setPropertyPage(1); }}
                />
              </div>
              {propertySearch && (
                <button onClick={() => setPropertySearch('')} className="btn btn-ghost" style={{ padding: '10px 14px', fontSize: 12 }}>
                  Effacer
                </button>
              )}
            </div>

            {/* Bulk Selection Bar */}
            {selectedProperties.size > 0 && (
              <div className="bulk-bar">
                <span className="bulk-bar__count">
                  <KycIcon name="check" size={14} style={{ color: 'var(--gold)' }} />
                  {selectedProperties.size} annonce(s) sélectionnée(s)
                </span>
                <div className="bulk-bar__actions">
                  <button className="btn-tiny btn-tiny-publish" onClick={() => handleBulkModeration('publish')}>
                    Publier la sélection
                  </button>
                  <button
                    className="btn-tiny btn-tiny-archive"
                    onClick={() => askConfirm(`Archiver ${selectedProperties.size} annonce(s) sélectionnée(s) ?`, () => handleBulkModeration('archive'))}
                  >
                    Archiver la sélection
                  </button>
                  <button className="btn-tiny" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={() => setSelectedProperties(new Set())}>
                    Désélectionner tout
                  </button>
                </div>
              </div>
            )}

            {filteredProperties.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px', background: '#FFFFFF', borderRadius: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(212,175,55,0.12)', color: 'var(--gold-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <KycIcon name="building" size={26} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Aucune annonce trouvée</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {properties.length === 0 ? 'Aucune annonce n’a encore été créée sur la plateforme.' : 'Aucune annonce ne correspond à vos filtres actuels.'}
                </p>
              </div>
            ) : propertyViewMode === 'grid' ? (
              /* Vue Grille Dashboard (Publications avec visuel riche et barre d'actions en bas) */
              <>
                <div className="admin-prop-grid">
                  {pagedProperties.map(p => {
                    const priceFormatted = parseInt(p.price || 0).toLocaleString('fr-FR');
                    const isRent = String(p.transaction_type || '').toLowerCase().includes('locat') || p.transaction_type === 'LOCATION';
                    const ownerInitials = (p.owner_name || 'B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={p.id}
                        className={`admin-prop-card ${selectedProperties.has(p.id) ? 'admin-prop-card--selected' : ''}`}
                      >
                        {/* Media Header */}
                        <div className="admin-prop-card__media">
                          <img
                            src={getMediaUrl(p.main_image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            onError={e => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="admin-prop-card__overlay-gradient" />

                          {/* Top Left: Checkbox + Tag */}
                          <div className="admin-prop-card__top-left">
                            <label className="admin-prop-check" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedProperties.has(p.id)}
                                onChange={() => togglePropertySelection(p.id)}
                                aria-label="Sélectionner l'annonce"
                              />
                              <span className="admin-prop-check__mark" />
                            </label>
                            <span className="admin-prop-badge admin-prop-badge--type">
                              {p.transaction_type} · {p.property_type}
                            </span>
                          </div>

                          {/* Top Right: Status */}
                          <div className="admin-prop-card__top-right">
                            <Seal tone={p.is_published ? 'approved' : 'pending'}>
                              <KycIcon name={p.is_published ? 'check' : 'clock'} size={11} style={{ marginRight: 3 }} />
                              <span>{p.is_published ? 'En ligne' : 'Brouillon'}</span>
                            </Seal>
                            {(p.is_featured || p.is_boosted) && (
                              <span className="admin-prop-boost-pill">
                                <KycIcon name="star" size={10} /> Vedette
                              </span>
                            )}
                          </div>

                          {/* Price Tag Overlay at Bottom of Media */}
                          <div className="admin-prop-card__price-tag">
                            <span className="admin-prop-card__price-val">{priceFormatted} FCFA</span>
                            {isRent && <span className="admin-prop-card__price-period">/ mois</span>}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="admin-prop-card__body">
                          <h3 className="admin-prop-card__title" title={p.title}>
                            <a href={`/properties/${p.id}`} target="_blank" rel="noreferrer">
                              {p.title}
                            </a>
                          </h3>

                          {/* Localisation */}
                          <div className="admin-prop-card__loc">
                            <KycIcon name="pin" size={12} style={{ color: 'var(--gold-deep)', flexShrink: 0 }} />
                            <span className="admin-prop-card__loc-text" title={`${p.city} ${p.neighborhood ? '· ' + p.neighborhood : ''}`}>
                              {p.city || 'Cameroun'}{p.neighborhood ? ` · ${p.neighborhood}` : ''}
                            </span>
                          </div>

                          {/* Specs */}
                          <div className="admin-prop-card__specs">
                            {p.area > 0 && (
                              <div className="admin-prop-spec">
                                <KycIcon name="surface" size={12} />
                                <span>{p.area} m²</span>
                              </div>
                            )}
                            <div className="admin-prop-spec">
                              <KycIcon name="bed" size={12} />
                              <span>{p.bedrooms || 0} ch.</span>
                            </div>
                            <div className="admin-prop-spec">
                              <KycIcon name="bath" size={12} />
                              <span>{p.bathrooms || 1} sdb</span>
                            </div>
                          </div>

                          {/* Landlord Row */}
                          <div className="admin-prop-card__owner">
                            <div className="admin-prop-card__owner-avatar">
                              {ownerInitials}
                            </div>
                            <div className="admin-prop-card__owner-info">
                              <div className="admin-prop-card__owner-name">
                                <span>{p.owner_name}</span>
                                {p.owner_verification_level >= 2 && (
                                  <span className="admin-verified-tag" title="Bailleur certifié">
                                    <KycIcon name="check" size={8} />
                                  </span>
                                )}
                              </div>
                              <div className="admin-prop-card__owner-sub">
                                {p.owner_phone || p.owner_email || 'Bailleur certifié'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions en bas (Bottom dedicated action bar) */}
                        <div className="admin-prop-card__actions">
                          <a
                            href={`/properties/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-prop-preview"
                            title="Aperçu de la page publique de l'annonce"
                          >
                            <KycIcon name="eye" size={13} />
                            <span>Aperçu</span>
                          </a>

                          {p.is_published ? (
                            <button
                              type="button"
                              onClick={() => askConfirm(`Archiver l'annonce "${p.title}" ? Elle sera retirée des résultats publics.`, () => handlePropertyModeration(p.id, 'archive'))}
                              className="btn btn-prop-archive"
                              title="Masquer et archiver cette annonce"
                            >
                              <KycIcon name="archive" size={13} />
                              <span>Archiver</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePropertyModeration(p.id, 'publish')}
                              className="btn btn-prop-publish"
                              title="Valider et publier cette annonce en ligne"
                            >
                              <KycIcon name="check" size={13} />
                              <span>Mettre en ligne</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Pagination page={propertyPage} total={filteredProperties.length} pageSize={PROPERTIES_PAGE_SIZE} onChange={setPropertyPage} />
                <div className="pagination-info">{filteredProperties.length} annonce(s) · page {propertyPage}</div>
              </>
            ) : (
              /* Vue Tableau Rapide */
              <>
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={selectedProperties.size > 0 && selectedProperties.size === pagedProperties.length}
                            onChange={toggleAllPropertiesSelection}
                            aria-label="Sélectionner tout"
                          />
                        </th>
                        <th>Annonce</th>
                        <th>Bailleur</th>
                        <th>Localisation &amp; Type</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedProperties.map(p => {
                        const priceFormatted = parseInt(p.price || 0).toLocaleString('fr-FR');
                        return (
                          <tr key={p.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedProperties.has(p.id)}
                                onChange={() => togglePropertySelection(p.id)}
                                aria-label="Sélectionner"
                              />
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img
                                  src={getMediaUrl(p.main_image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80')}
                                  alt={p.title}
                                  style={{ width: 54, height: 42, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }}
                                />
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{p.title}</div>
                                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                                    {p.property_type} · {p.area ? `${p.area} m²` : ''} {p.bedrooms ? `· ${p.bedrooms} ch.` : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{p.owner_name}</div>
                              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.owner_phone || p.owner_email || '—'}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{p.city} {p.neighborhood ? `(${p.neighborhood})` : ''}</div>
                              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.transaction_type}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--gold-deep)', fontFamily: 'IBM Plex Mono' }}>
                                {priceFormatted} FCFA
                              </div>
                            </td>
                            <td>
                              <Seal tone={p.is_published ? 'approved' : 'pending'}>
                                {p.is_published ? 'En ligne' : 'Brouillon'}
                              </Seal>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6 }}>
                                <a
                                  href={`/properties/${p.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-gold-outline"
                                  style={{ padding: '6px 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                >
                                  <KycIcon name="eye" size={12} />
                                  <span>Voir</span>
                                </a>
                                {p.is_published ? (
                                  <button
                                    type="button"
                                    onClick={() => askConfirm(`Archiver l'annonce "${p.title}" ?`, () => handlePropertyModeration(p.id, 'archive'))}
                                    className="btn btn-danger-ghost"
                                    style={{ padding: '6px 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                  >
                                    <KycIcon name="archive" size={12} />
                                    <span>Archiver</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handlePropertyModeration(p.id, 'publish')}
                                    className="btn btn-gold"
                                    style={{ padding: '6px 12px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                  >
                                    <KycIcon name="check" size={12} />
                                    <span>Publier</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={propertyPage} total={filteredProperties.length} pageSize={PROPERTIES_PAGE_SIZE} onChange={setPropertyPage} />
                <div className="pagination-info">{filteredProperties.length} annonce(s) · page {propertyPage}</div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 4b: MODE DÉCOUVERTE & REELS (TRAFIC & MODÉRATION) ── */}
        {activeTab === 'discovery' && (
          <div>
            <div className="tab-header" style={{ marginBottom: 20 }}>
              <div>
                <h2 className="disp" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <KycIcon name="camera" size={22} style={{ color: 'var(--gold)' }} />
                  Gestion &amp; Modération du Mode Découverte (Reels)
                </h2>
                <div className="tab-sub">
                  Contrôlez les vidéos diffusées, bloquez les contenus non conformes et propulsez les meilleurs biens en vedette
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a
                  href="/discovery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-reset"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(246,211,101,0.05))',
                    border: '1px solid rgba(212,175,55,0.4)',
                    color: 'var(--gold-deep)',
                    fontWeight: 700,
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 13
                  }}
                >
                  <KycIcon name="eye" size={14} />
                  Ouvrir le flux Découverte public
                </a>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Total Vidéos Déposées</span>
                  <span className="kpi-card__icon" style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                    <KycIcon name="camera" size={16} />
                  </span>
                </div>
                <div className="kpi-card__val">{kpis.total_discovery_reels || (data?.discovery_reels?.length || 0)}</div>
                <div className="kpi-card__sub">Annonces avec vidéo courte</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">En Diffusion Active</span>
                  <span className="kpi-card__icon" style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--green)' }}>
                    <KycIcon name="check" size={16} />
                  </span>
                </div>
                <div className="kpi-card__val" style={{ color: 'var(--green)' }}>{kpis.active_discovery_reels || 0}</div>
                <div className="kpi-card__sub">Visibles dans l'application</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Bloquées / En Pause</span>
                  <span className="kpi-card__icon" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                    <KycIcon name="alert" size={16} />
                  </span>
                </div>
                <div className="kpi-card__val" style={{ color: (kpis.blocked_discovery_reels || 0) > 0 ? 'var(--red)' : 'var(--ink-soft)' }}>
                  {kpis.blocked_discovery_reels || 0}
                </div>
                <div className="kpi-card__sub">Exclues du flux Découverte</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Trafic &amp; Vues Cumulées</span>
                  <span className="kpi-card__icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                    <KycIcon name="eye" size={16} />
                  </span>
                </div>
                <div className="kpi-card__val">{kpis.total_discovery_views || 0}</div>
                <div className="kpi-card__sub">Lectures réelles enregistrées</div>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="kyc-meta-bar" style={{ marginBottom: 14 }}>
              <div className="kyc-quick-pills">
                {[
                  { id: 'ALL', label: 'Toutes les vidéos', count: discoveryReelsList.length, icon: null },
                  { id: 'ACTIVE', label: 'En diffusion', count: discoveryReelsList.filter(r => r.is_in_discovery && r.is_published).length, icon: 'check' },
                  { id: 'BLOCKED', label: 'Bloquées / Masquées', count: discoveryReelsList.filter(r => !r.is_in_discovery || !r.is_published).length, icon: 'x' },
                  { id: 'FEATURED', label: 'Vedettes Découverte', count: discoveryReelsList.filter(r => r.is_discovery_featured).length, icon: 'star' },
                ].map(pill => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => { setDiscoveryFilter(pill.id); setDiscoveryPage(1); }}
                    className={`kyc-pill-btn ${discoveryFilter === pill.id ? 'kyc-pill-btn--active' : ''}`}
                  >
                    {pill.icon && <KycIcon name={pill.icon} size={13} />}
                    <span>{pill.label}</span>
                    <span className="kyc-pill-count">{pill.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Toolbar */}
            <div className="toolbar" style={{ marginBottom: 22 }}>
              <div className="search-field">
                <Icon path="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" size={15} />
                <input
                  placeholder="Rechercher une vidéo par titre, ville, quartier, bailleur…"
                  value={discoverySearch}
                  onChange={e => { setDiscoverySearch(e.target.value); setDiscoveryPage(1); }}
                />
              </div>
              {discoverySearch && (
                <button
                  type="button"
                  onClick={() => setDiscoverySearch('')}
                  className="btn btn-ghost"
                  style={{ padding: '10px 14px', fontSize: 12 }}
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Video Cards Grid */}
            {filteredDiscoveryReels.length === 0 ? (
              <div className="empty-state">
                <KycIcon name="camera" size={32} />
                <div className="empty-state__title">Aucune vidéo ne correspond à ce filtre</div>
                <div className="empty-state__sub">Les vidéos courtes publiées par les bailleurs apparaîtront automatiquement ici pour votre modération.</div>
              </div>
            ) : (
              <>
                <div className="discovery-admin-grid">
                  {pagedDiscoveryReels.map(reel => {
                    const isVisible = Boolean(reel.is_in_discovery && reel.is_published);
                    const isFeatured = Boolean(reel.is_discovery_featured);
                    const videoSrc = getMediaUrl(reel.video_url);

                    return (
                      <div key={reel.id} className={`discovery-admin-card ${!isVisible ? 'discovery-admin-card--blocked' : ''} ${isFeatured ? 'discovery-admin-card--featured' : ''}`}>
                        {/* Video Player Box */}
                        <div className="discovery-admin-card__video-wrap">
                          {videoSrc ? (
                            <video
                              src={videoSrc}
                              controls
                              preload="metadata"
                              poster={getMediaUrl(reel.cover_image)}
                              className="discovery-admin-card__video"
                              playsInline
                            />
                          ) : (
                            <div className="discovery-admin-card__no-video">
                              <KycIcon name="alert" size={24} />
                              <span>Fichier vidéo indisponible</span>
                            </div>
                          )}

                          {/* Overlay Badges */}
                          <div className="discovery-admin-card__badges">
                            {isFeatured && (
                              <span className="discovery-badge discovery-badge--featured">
                                <KycIcon name="star" size={11} />
                                Vedette
                              </span>
                            )}
                            {isVisible ? (
                              <span className="discovery-badge discovery-badge--active">
                                <KycIcon name="check" size={10} />
                                Diffusé
                              </span>
                            ) : (
                              <span className="discovery-badge discovery-badge--blocked">
                                <KycIcon name="x" size={10} />
                                Bloqué
                              </span>
                            )}
                          </div>

                          {/* Quick Stats Pill */}
                          <div className="discovery-admin-card__stats-pill">
                            <span><KycIcon name="eye" size={11} /> {reel.discovery_views_count || 0}</span>
                            <span><KycIcon name="star" size={11} /> {reel.discovery_likes_count || 0}</span>
                          </div>
                        </div>

                        {/* Content & Metadata */}
                        <div className="discovery-admin-card__body">
                          <div className="discovery-admin-card__title" title={reel.title}>
                            {reel.title}
                          </div>

                          <div className="discovery-admin-card__loc">
                            <KycIcon name="pin" size={12} />
                            <span>{reel.neighborhood ? `${reel.neighborhood}, ` : ''}{reel.city || 'Cameroun'}</span>
                            <span className="discovery-admin-card__price">{Number(reel.price || 0).toLocaleString()} FCFA</span>
                          </div>

                          {reel.reel_description && (
                            <div className="discovery-admin-card__caption" title={reel.reel_description}>
                              « {reel.reel_description} »
                            </div>
                          )}

                          {reel.discovery_blocked_reason && !isVisible && (
                            <div className="discovery-admin-card__blocked-msg">
                              Motif : {reel.discovery_blocked_reason}
                            </div>
                          )}

                          <div className="discovery-admin-card__author">
                            <div className="discovery-admin-card__avatar">
                              {reel.owner_name ? reel.owner_name.charAt(0).toUpperCase() : 'B'}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="discovery-admin-card__author-name">{reel.owner_name || 'Bailleur'}</div>
                              <div className="discovery-admin-card__author-sub">{reel.owner_phone || 'Piolo Membre'}</div>
                            </div>
                          </div>

                          {/* Action Bottom Bar */}
                          <div className="discovery-admin-card__actions">
                            <button
                              type="button"
                              onClick={() => handleDiscoveryModerate(reel.id, 'toggle_visibility')}
                              className={`btn-action-pill ${isVisible ? 'btn-action-pill--danger' : 'btn-action-pill--success'}`}
                              title={isVisible ? 'Bloquer ce Reel du flux' : 'Autoriser ce Reel dans le flux'}
                            >
                              <KycIcon name={isVisible ? 'x' : 'check'} size={12} />
                              {isVisible ? 'Bloquer' : 'Diffuser'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDiscoveryModerate(reel.id, 'toggle_featured')}
                              className={`btn-action-pill ${isFeatured ? 'btn-action-pill--active-featured' : 'btn-action-pill--gold'}`}
                              title={isFeatured ? 'Retirer des vedettes' : 'Propulser en Vedette Découverte'}
                            >
                              <KycIcon name="star" size={12} />
                              {isFeatured ? 'En Vedette' : 'Vedette'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setDiscoveryModalVideo(reel)}
                              className="btn-action-pill btn-action-pill--preview"
                              title="Tester la simulation Smartphone"
                            >
                              <KycIcon name="eye" size={12} />
                              Aperçu
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                askConfirm(`Êtes-vous sûr de vouloir supprimer définitivement la vidéo Reel de l'annonce « ${reel.title} » ?`, () => {
                                  handleDiscoveryModerate(reel.id, 'delete_video');
                                });
                              }}
                              className="btn-action-pill btn-action-pill--delete"
                              title="Supprimer la vidéo"
                            >
                              <KycIcon name="archive" size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  page={discoveryPage}
                  total={filteredDiscoveryReels.length}
                  pageSize={6}
                  onChange={setDiscoveryPage}
                />
                <div className="pagination-info">{filteredDiscoveryReels.length} vidéo(s) Réel · page {discoveryPage}</div>
              </>
            )}

            {/* Smartphone Simulator Preview Modal */}
            {discoveryModalVideo && (
              <div className="modal-overlay" onClick={() => setDiscoveryModalVideo(null)}>
                <div className="phone-sim-modal" onClick={e => e.stopPropagation()}>
                  <div className="phone-sim-modal__header">
                    <div className="phone-sim-modal__title">
                      <KycIcon name="camera" size={16} />
                      Simulation Mode Découverte Mobile (9:16)
                    </div>
                    <button type="button" onClick={() => setDiscoveryModalVideo(null)} className="phone-sim-modal__close">✕</button>
                  </div>

                  <div className="phone-sim-frame">
                    <div className="phone-sim-frame__speaker" />
                    <video
                      src={getMediaUrl(discoveryModalVideo.video_url)}
                      autoPlay
                      loop
                      controls
                      playsInline
                      className="phone-sim-frame__video"
                    />

                    {/* Simulated Floating Actions */}
                    <div className="phone-sim-frame__overlay">
                      <div className="phone-sim-frame__bottom-info">
                        <div className="phone-sim-frame__prop-title">{discoveryModalVideo.title}</div>
                        <div className="phone-sim-frame__prop-price">{Number(discoveryModalVideo.price || 0).toLocaleString()} FCFA / mois</div>
                        <div className="phone-sim-frame__prop-desc">{discoveryModalVideo.reel_description || 'Découvrez ce logement d\'exception sur Piolo Immobilier.'}</div>
                      </div>

                      <div className="phone-sim-frame__side-actions">
                        <div className="phone-sim-action-btn">
                          <KycIcon name="star" size={18} />
                          <span>{discoveryModalVideo.discovery_likes_count || 0}</span>
                        </div>
                        <div className="phone-sim-action-btn">
                          <KycIcon name="eye" size={18} />
                          <span>{discoveryModalVideo.discovery_views_count || 0}</span>
                        </div>
                        <div className="phone-sim-action-btn">
                          <KycIcon name="whatsapp" size={18} />
                          <span>Contact</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4c: FINANCES & REVENUS ANALYTICS ── */}
        {activeTab === 'finance' && (
          <div className="finance-analytics-container">
            <div className="tab-header" style={{ marginBottom: 10 }}>
              <div>
                <h2 className="disp" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <KycIcon name="money" size={22} style={{ color: 'var(--gold)' }} />
                  Tableau des Revenus &amp; Gestion Financière
                </h2>
                <div className="tab-sub">
                  Suivi en direct du chiffre d'affaires, des encaissements Mobile Money et de la monétisation des services Piolo
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => exportTransactionsCSV(filteredTransactions)}
                  className="btn-reset"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(246,211,101,0.05))',
                    border: '1px solid rgba(212,175,55,0.4)',
                    color: 'var(--gold-deep)',
                    fontWeight: 700,
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  <KycIcon name="download" size={14} />
                  Exporter les transactions (CSV)
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="finance-kpi-grid">
              <div className="finance-kpi-card">
                <div className="finance-kpi-card__top">
                  <span className="finance-kpi-card__label">Chiffre d'Affaires Global</span>
                  <span className="finance-kpi-card__icon" style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                    <KycIcon name="money" size={18} />
                  </span>
                </div>
                <div className="finance-kpi-card__val" style={{ color: 'var(--gold-deep)' }}>
                  {Number(financials.total_revenue || 0).toLocaleString()} <span style={{ fontSize: 16 }}>FCFA</span>
                </div>
                <div className="finance-kpi-card__sub">
                  Total des encaissements cumulés
                </div>
              </div>

              <div className="finance-kpi-card">
                <div className="finance-kpi-card__top">
                  <span className="finance-kpi-card__label">Revenu du Mois en Cours</span>
                  <span className="finance-kpi-card__icon" style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--green)' }}>
                    <KycIcon name="check" size={18} />
                  </span>
                </div>
                <div className="finance-kpi-card__val" style={{ color: 'var(--green)' }}>
                  {Number(financials.monthly_revenue || 0).toLocaleString()} <span style={{ fontSize: 16 }}>FCFA</span>
                </div>
                <div className="finance-kpi-card__sub">
                  Encaissements sur les 30 derniers jours
                </div>
              </div>

              <div className="finance-kpi-card">
                <div className="finance-kpi-card__top">
                  <span className="finance-kpi-card__label">Transactions Traitées</span>
                  <span className="finance-kpi-card__icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                    <KycIcon name="file" size={18} />
                  </span>
                </div>
                <div className="finance-kpi-card__val">
                  {rawTransactions.length}
                </div>
                <div className="finance-kpi-card__sub">
                  Paiements enregistrés et archivés
                </div>
              </div>

              <div className="finance-kpi-card">
                <div className="finance-kpi-card__top">
                  <span className="finance-kpi-card__label">Services &amp; Monétisation</span>
                  <span className="finance-kpi-card__icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                    <KycIcon name="star" size={18} />
                  </span>
                </div>
                <div className="finance-kpi-card__val" style={{ fontSize: 20 }}>
                  {financials.sub_count || 0} Pass · {financials.concierge_count || 0} Mandats
                </div>
                <div className="finance-kpi-card__sub">
                  + {financials.boost_count || 0} boosts d'annonces
                </div>
              </div>
            </div>

            {/* Graphs & Distribution */}
            <div className="finance-double-grid">
              {/* Monthly Trend SVG Histogram */}
              <div className="finance-chart-card">
                <div className="finance-chart-card__header">
                  <div className="finance-chart-card__title">
                    <KycIcon name="chart" size={18} style={{ color: 'var(--gold)' }} />
                    Évolution du Chiffre d'Affaires (6 derniers mois)
                  </div>
                  <div className="finance-chart-legend">
                    <div className="finance-legend-item">
                      <span className="finance-legend-dot" style={{ background: 'linear-gradient(135deg, #D4AF37, #F6D365)' }} />
                      <span>Revenu Global</span>
                    </div>
                  </div>
                </div>

                {/* SVG Chart */}
                {(!financials.monthly_trend || financials.monthly_trend.length === 0) ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}>
                    Données d'historique en cours de collecte...
                  </div>
                ) : (
                  <div style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 190, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                      {(() => {
                        const maxVal = Math.max(...financials.monthly_trend.map(m => m.revenue), 50000);
                        return financials.monthly_trend.map(m => {
                          const heightPct = Math.max(12, Math.round((m.revenue / maxVal) * 100));
                          return (
                            <div key={m.month_key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, maxWidth: 65 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold-deep)' }}>
                                {m.revenue > 0 ? `${Math.round(m.revenue / 1000)}k` : '0'}
                              </div>
                              <div
                                title={`${m.label}: ${m.revenue.toLocaleString()} FCFA`}
                                style={{
                                  width: '70%',
                                  height: `${heightPct}%`,
                                  background: 'linear-gradient(180deg, #D4AF37 0%, #A67C1E 100%)',
                                  borderRadius: '6px 6px 2px 2px',
                                  transition: 'height 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(212,175,55,0.25)'
                                }}
                              />
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                                {m.label}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods Breakdown */}
              <div className="finance-chart-card">
                <div className="finance-chart-card__title" style={{ marginBottom: 16 }}>
                  <KycIcon name="shield" size={17} style={{ color: 'var(--gold)' }} />
                  Opérateurs &amp; Méthodes de Paiement
                </div>

                <div className="finance-methods-grid">
                  <div className="finance-method-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="finance-method-logo finance-method-logo--om">OM</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>Orange Money</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                          {financials.payment_methods?.om?.count || 0} transaction(s)
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#FF6600' }}>
                        {Number(financials.payment_methods?.om?.amount || 0).toLocaleString()} FCFA
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>Cameroun</div>
                    </div>
                  </div>

                  <div className="finance-method-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="finance-method-logo finance-method-logo--momo">MoMo</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>MTN Mobile Money</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                          {financials.payment_methods?.momo?.count || 0} transaction(s)
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#D97706' }}>
                        {Number(financials.payment_methods?.momo?.amount || 0).toLocaleString()} FCFA
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>Cameroun</div>
                    </div>
                  </div>

                  <div className="finance-method-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="finance-method-logo finance-method-logo--card">CB</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>Carte Bancaire / Stripe</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                          {financials.payment_methods?.card?.count || 0} transaction(s)
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#2563EB' }}>
                        {Number(financials.payment_methods?.card?.amount || 0).toLocaleString()} FCFA
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>International &amp; Diaspora</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="kyc-meta-bar" style={{ marginTop: 10, marginBottom: 14 }}>
              <div className="kyc-quick-pills">
                {[
                  { id: 'ALL', label: 'Toutes les transactions', count: rawTransactions.length, icon: null },
                  { id: 'SUBSCRIPTION', label: 'Pass VIP Locataires', count: financials.sub_count || 0, icon: 'star' },
                  { id: 'CONCIERGE', label: 'Mandats Conciergerie', count: financials.concierge_count || 0, icon: 'building' },
                  { id: 'BOOST', label: 'Boosts d\'Annonces', count: financials.boost_count || 0, icon: 'check' },
                ].map(pill => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => { setFinanceFilter(pill.id); setFinancePage(1); }}
                    className={`kyc-pill-btn ${financeFilter === pill.id ? 'kyc-pill-btn--active' : ''}`}
                  >
                    {pill.icon && <KycIcon name={pill.icon} size={13} />}
                    <span>{pill.label}</span>
                    <span className="kyc-pill-count">{pill.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar Search & Method Filter */}
            <div className="toolbar" style={{ marginBottom: 20 }}>
              <div className="search-field">
                <Icon path="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" size={15} />
                <input
                  placeholder="Rechercher par utilisateur, email, téléphone, référence, montant…"
                  value={financeSearch}
                  onChange={e => { setFinanceSearch(e.target.value); setFinancePage(1); }}
                />
              </div>
              <select
                value={financeMethodFilter}
                onChange={e => { setFinanceMethodFilter(e.target.value); setFinancePage(1); }}
                className="select"
                style={{ minWidth: 180 }}
              >
                <option value="ALL">Tous les moyens de paiement</option>
                <option value="OM">Orange Money (OM)</option>
                <option value="MOMO">MTN Mobile Money (MoMo)</option>
                <option value="CARD">Carte Bancaire / Stripe</option>
                <option value="POINTS">Points Piolo</option>
              </select>
              {financeSearch && (
                <button
                  type="button"
                  onClick={() => setFinanceSearch('')}
                  className="btn btn-ghost"
                  style={{ padding: '10px 14px', fontSize: 12 }}
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Transactions Table */}
            <div className="tx-table-card">
              {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <KycIcon name="money" size={32} />
                  <div className="empty-state__title">Aucune transaction enregistrée</div>
                  <div className="empty-state__sub">Les souscriptions d'abonnements, mandats et recharges apparaîtront automatiquement ici.</div>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="tx-table">
                      <thead>
                        <tr>
                          <th>RÉFÉRENCE &amp; SERVICE</th>
                          <th>CLIENT / UTILISATEUR</th>
                          <th>MOYEN DE PAIEMENT</th>
                          <th>MONTANT (FCFA)</th>
                          <th>DATE &amp; HEURE</th>
                          <th>STATUT</th>
                          <th>DÉTAILS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{tx.reference}</div>
                              <span className={`tx-type-pill ${tx.type === 'SUBSCRIPTION' ? 'tx-type-pill--sub' : tx.type === 'CONCIERGE' ? 'tx-type-pill--mand' : 'tx-type-pill--boost'}`}>
                                {tx.type_label}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{tx.user_name}</div>
                              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{tx.user_email || tx.user_phone}</div>
                            </td>
                            <td>
                              <span className={`tx-method-badge tx-method-badge--${(tx.payment_method || '').toLowerCase()}`}>
                                <KycIcon name="check" size={10} />
                                {tx.payment_method_label}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--gold-deep)' }}>
                                {Number(tx.amount || 0).toLocaleString()} FCFA
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>
                                {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>
                                {new Date(tx.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td>
                              <Seal tone={tx.status === 'ACTIVE' || tx.status === 'COMPLETED' ? 'approved' : tx.status === 'EXPIRED' ? 'pending' : 'rejected'}>
                                {tx.status === 'ACTIVE' ? 'Actif' : tx.status === 'COMPLETED' ? 'Payé' : tx.status === 'EXPIRED' ? 'Expiré' : 'Annulé'}
                              </Seal>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 220 }}>
                              {tx.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination
                    page={financePage}
                    total={filteredTransactions.length}
                    pageSize={8}
                    onChange={setFinancePage}
                  />
                  <div className="pagination-info" style={{ marginTop: 12 }}>
                    {filteredTransactions.length} transaction(s) au total · page {financePage}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4d: DIFFUSION DE NOTIFICATIONS & ALERTES FLASH (BROADCAST) ── */}
        {activeTab === 'broadcast' && (
          <div>
            <div className="tab-header" style={{ marginBottom: 20 }}>
              <div>
                <h2 className="disp" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <KycIcon name="broadcast" size={22} style={{ color: 'var(--gold)' }} />
                  Centre de Diffusion &amp; Alertes Flash (Broadcast)
                </h2>
                <div className="tab-sub">
                  Diffusez instantanément des messages push in-app, des notifications urgentes ou des annonces promotionnelles à vos communautés
                </div>
              </div>
            </div>

            {/* Broadcast Grid (Composer + Live Mobile Preview) */}
            <div className="broadcast-grid" style={{ marginBottom: 30 }}>
              {/* Form Composer */}
              <div className="broadcast-card">
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <KycIcon name="send" size={16} style={{ color: 'var(--gold)' }} />
                  Composer une Alerte Flash / Push
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>
                  Sélectionnez l'audience ciblée, définissez l'urgence et rédigez votre communication officielle.
                </div>

                <form onSubmit={handleSendBroadcast}>
                  {/* Target Audience */}
                  <label className="form-label" style={{ marginBottom: 4 }}>
                    <span>Audience Cible :</span>
                  </label>
                  <div className="audience-selector">
                    {[
                      { id: 'ALL', title: 'Tous les membres', sub: `${users.length} comptes actifs` },
                      { id: 'BAILLEUR', title: 'Bailleurs uniquement', sub: `${users.filter(u => u.role === 'BAILLEUR').length} propriétaires` },
                      { id: 'LOCATAIRE', title: 'Locataires uniquement', sub: `${users.filter(u => u.role === 'LOCATAIRE').length} locataires` },
                      { id: 'PROFESSIONNEL', title: 'Pros & Artisans', sub: `${users.filter(u => ['PROFESSIONNEL', 'ARCHITECTE'].includes(u.role)).length} professionnels` },
                    ].map(aud => (
                      <div
                        key={aud.id}
                        onClick={() => setBroadcastForm({ ...broadcastForm, target_audience: aud.id })}
                        className={`audience-btn ${broadcastForm.target_audience === aud.id ? 'audience-btn--active' : ''}`}
                      >
                        <div className="audience-btn__title">{aud.title}</div>
                        <div className="audience-btn__sub">{aud.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Priority & Category */}
                  <div className="form-grid-2" style={{ margin: '0 0 16px' }}>
                    <label className="form-label">
                      <span>Niveau d'Urgence :</span>
                      <select
                        value={broadcastForm.priority}
                        onChange={e => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                      >
                        <option value="NORMAL">Standard (Notification Normale)</option>
                        <option value="HIGH">Haute Priorité (Alerte Flash Critique)</option>
                      </select>
                    </label>

                    <label className="form-label">
                      <span>Catégorie de Message :</span>
                      <select
                        value={broadcastForm.kind}
                        onChange={e => setBroadcastForm({ ...broadcastForm, kind: e.target.value })}
                      >
                        <option value="SYSTEM">Système &amp; Maintenance</option>
                        <option value="ALERT">Alerte Sécurité &amp; Urgence</option>
                        <option value="PROPERTY">Annonces &amp; Immobilier</option>
                        <option value="ACCOUNT">Offres &amp; Abonnements VIP</option>
                      </select>
                    </label>
                  </div>

                  {/* Title */}
                  <label className="form-label" style={{ marginBottom: 14 }}>
                    <span>Titre de l'Alerte :</span>
                    <input
                      type="text"
                      placeholder="Ex: Nouveauté : Visites immersives 360° disponibles !"
                      value={broadcastForm.title}
                      onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      maxLength={120}
                      required
                    />
                  </label>

                  {/* Body Message */}
                  <label className="form-label" style={{ marginBottom: 14 }}>
                    <span>Message complet :</span>
                    <textarea
                      rows={4}
                      placeholder="Saisissez ici le texte de votre annonce push qui apparaîtra sur les écrans des utilisateurs..."
                      value={broadcastForm.body}
                      onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                      style={{
                        width: '100%',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--line)',
                        padding: '10px 12px',
                        background: 'var(--field)',
                        color: 'var(--ink)',
                        font: 'inherit',
                        resize: 'vertical'
                      }}
                      required
                    />
                  </label>

                  {/* Redirect URL */}
                  <label className="form-label" style={{ marginBottom: 20 }}>
                    <span>Lien d'action in-app (Optionnel) :</span>
                    <input
                      type="text"
                      placeholder="Ex: /decouverte ou /properties ou /support"
                      value={broadcastForm.url}
                      onChange={e => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
                    />
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={broadcastSending}
                    className="btn-save-top"
                    style={{ width: '100%', padding: '12px 20px', fontSize: 14, justifyContent: 'center' }}
                  >
                    <KycIcon name="send" size={16} />
                    {broadcastSending ? 'Diffusion en cours...' : 'Diffuser la notification maintenant'}
                  </button>
                </form>
              </div>

              {/* Live Smartphone / Push Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="push-preview-frame">
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KycIcon name="eye" size={14} />
                    Aperçu Push Notification en direct
                  </div>

                  {/* Banner Simulator */}
                  <div className="push-preview-banner">
                    <div className="push-preview-app-icon">P</div>
                    <div className="push-preview-content">
                      <div className="push-preview-header">
                        <span className="push-preview-app-name">PIOLO IMMOBILIER</span>
                        <span className="push-preview-time">À l'instant</span>
                      </div>
                      <div className="push-preview-title">
                        {broadcastForm.title || 'Titre de votre notification'}
                      </div>
                      <div className="push-preview-body">
                        {broadcastForm.body || 'Le texte complet de votre alerte apparaîtra ainsi sur les téléphones et navigateurs de vos utilisateurs.'}
                      </div>
                      {broadcastForm.url && (
                        <div className="push-preview-link">
                          <span>Ouvrir {broadcastForm.url}</span>
                          <span>→</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
                    🛡️ <strong>Distribution Immédiate :</strong> Cette notification sera injectée instantanément dans le centre de notifications de chaque utilisateur concerné et restera consultable dans son historique personnel.
                  </div>
                </div>

                {/* Target Audience stats card */}
                <div className="broadcast-card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                    Audience Sélectionnée
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {broadcastForm.target_audience === 'ALL' && `Tous les utilisateurs inscrits (${users.length} comptes)`}
                    {broadcastForm.target_audience === 'BAILLEUR' && `Bailleurs (${users.filter(u => u.role === 'BAILLEUR').length} propriétaires)`}
                    {broadcastForm.target_audience === 'LOCATAIRE' && `Locataires (${users.filter(u => u.role === 'LOCATAIRE').length} locataires)`}
                    {broadcastForm.target_audience === 'PROFESSIONNEL' && `Professionnels (${users.filter(u => ['PROFESSIONNEL', 'ARCHITECTE'].includes(u.role)).length} pros)`}
                  </div>
                </div>
              </div>
            </div>

            {/* Broadcast History Table */}
            <div className="tx-table-card">
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <KycIcon name="clock" size={16} style={{ color: 'var(--gold)' }} />
                Historique des Campagnes de Diffusion Récentes
              </div>

              {broadcastHistory.length === 0 ? (
                <div className="empty-state">
                  <KycIcon name="broadcast" size={30} />
                  <div className="empty-state__title">Aucune diffusion enregistrée</div>
                  <div className="empty-state__sub">Vos alertes push et messages broadcast apparaîtront ici pour assurer le suivi d'audit.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="tx-table">
                    <thead>
                      <tr>
                        <th>DATE &amp; HEURE</th>
                        <th>TITRE DE L'ALERTE</th>
                        <th>AUDIENCE</th>
                        <th>DESTINATAIRES</th>
                        <th>PRIORITÉ</th>
                        <th>ENVOYÉ PAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {broadcastHistory.map(b => (
                        <tr key={b.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>
                              {new Date(b.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                              {new Date(b.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{b.title}</div>
                            {b.body && <div style={{ fontSize: 11, color: 'var(--ink-soft)', maxWidth: 300 }}>{b.body}</div>}
                          </td>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: 'rgba(212,175,55,0.12)', color: 'var(--gold-deep)' }}>
                              {b.target_audience === 'ALL' ? 'Tous' : b.target_audience}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: 'var(--green)' }}>
                              {b.recipients_count} utilisateur(s)
                            </span>
                          </td>
                          <td>
                            <Seal tone={b.priority === 'HIGH' ? 'urgent' : 'approved'}>
                              {b.priority === 'HIGH' ? 'Haute' : 'Normale'}
                            </Seal>
                          </td>
                          <td style={{ fontSize: 12, fontWeight: 600 }}>
                            {b.sent_by}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: APPARENCE & PARAMÈTRES GLOBAUX ── */}
        {activeTab === 'theme' && (
          <div>
            <div className="config-header">
              <div className="config-header__left">
                <div className="config-header__icon"><Glyph name="settings" size={22} /></div>
                <div>
                  <h2 className="disp">Centre de configuration</h2>
                  <div className="config-header__sub">Personnalisez l'identité visuelle, les intégrations et les paramètres métier de la plateforme</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setIsPreviewOpen(true)} className="btn-reset" style={{ padding: '10px 16px', background: 'var(--paper)', border: '1px solid var(--gold)', color: 'var(--gold-deep)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Glyph name="eye" size={14} />
                  Prévisualiser
                </button>
                <button type="button" onClick={() => setIsHistoryOpen(true)} className="btn-reset" style={{ padding: '10px 16px', background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Glyph name="history" size={14} />
                  Historique (Versions)
                </button>
                <button type="button" onClick={() => document.getElementById('theme-config-form').requestSubmit()} className="btn-save-top">
                  <Glyph name="save" size={16} />
                  Sauvegarder &amp; appliquer
                </button>
              </div>
            </div>

            <form id="theme-config-form" onSubmit={handleSaveTheme}>
              <div className="config-shell">

                {/* Navigation des sections par piliers hiérarchiques */}
                <nav className="config-nav">
                  {CONFIG_CATEGORIES.map(cat => (
                    <div key={cat.category} className="config-nav__group">
                      <div className="config-nav__category-title">{cat.category}</div>
                      <div className="config-nav__items-list">
                        {cat.items.map(item => (
                          <a
                            key={item.id}
                            href={`#cfg-${item.id}`}
                            onClick={e => { e.preventDefault(); scrollToConfigSection(item.id); }}
                            className="config-nav__item"
                          >
                            <Glyph name={item.icon} size={15} />
                            <span>{item.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Sections */}
                <div>

                  {/* ── BRANDING ── */}
                  <section id="cfg-branding" className="config-section">
                    <div className="config-section__head">
                      <div className="config-section__head-left">
                        <span className="config-section__icon"><Glyph name="image" size={17} /></span>
                        <div>
                          <div className="config-section__title">Branding & identité visuelle</div>
                          <div className="config-section__desc">Nom, slogan et logo de la plateforme</div>
                        </div>
                      </div>
                    </div>
                    <div className="config-section__body">
                      <div className="field-grid">
                        <div className="field">
                          <label>Nom officiel du site</label>
                          <input type="text" value={themeForm.site_name || ''} onChange={e => setThemeForm({ ...themeForm, site_name: e.target.value })} placeholder="Ex : Piolo Immobilier" />
                        </div>
                        <div className="field">
                          <label>Slogan officiel</label>
                          <input type="text" value={themeForm.site_slogan || ''} onChange={e => setThemeForm({ ...themeForm, site_slogan: e.target.value })} placeholder="Ex : La référence immobilière" />
                        </div>
                        <div className="field">
                          <label>URL logo (mode clair)</label>
                          <input type="text" value={themeForm.logo_url || ''} onChange={e => setThemeForm({ ...themeForm, logo_url: e.target.value })} placeholder="/img/logo.png" />
                        </div>
                        <div className="field">
                          <label>URL logo (mode sombre)</label>
                          <input type="text" value={themeForm.logo_dark_url || ''} onChange={e => setThemeForm({ ...themeForm, logo_dark_url: e.target.value })} placeholder="/img/logo-dark.png" />
                        </div>
                      </div>
                      {themeForm.logo_url && (
                        <div className="logo-preview">
                          <img src={themeForm.logo_url} alt="Aperçu du logo" onError={e => { e.target.style.display = 'none'; }} />
                          <span>Aperçu du logo actuel</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ── TYPOGRAPHIE ── */}
                  <section id="cfg-typo" className="config-section">
                    <div className="config-section__head">
                      <div className="config-section__head-left">
                        <span className="config-section__icon"><Glyph name="type" size={17} /></span>
                        <div>
                          <div className="config-section__title">Typographie & polices</div>
                          <div className="config-section__desc">Polices des titres et du corps de texte</div>
                        </div>
                      </div>
                    </div>
                    <div className="config-section__body">
                      <div className="field-grid">
                        <div className="field">
                          <label>Police des titres</label>
                          <select value={themeForm.font_heading || 'Poppins'} onChange={e => setThemeForm({ ...themeForm, font_heading: e.target.value })}>
                            {FONT_HEADING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label>Police du corps de texte</label>
                          <select value={themeForm.font_body || 'Inter'} onChange={e => setThemeForm({ ...themeForm, font_body: e.target.value })}>
                            {FONT_BODY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="font-preview">
                        <div className="font-preview__label">Aperçu en temps réel</div>
                        <div className="font-preview__heading" style={{ fontFamily: `'${themeForm.font_heading || 'Poppins'}', sans-serif` }}>
                          Piolo Immobilier — La référence au Cameroun
                        </div>
                        <div className="font-preview__body" style={{ fontFamily: `'${themeForm.font_body || 'Inter'}', sans-serif` }}>
                          Trouvez votre logement idéal parmi des milliers d'annonces vérifiées et certifiées Piolo.
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── COULEURS ── */}
                  <section id="cfg-colors" className="config-section">
                    <div className="config-section__head">
                      <div className="config-section__head-left">
                        <span className="config-section__icon"><Glyph name="palette" size={17} /></span>
                        <div>
                          <div className="config-section__title">Palette de couleurs</div>
                          <div className="config-section__desc">Couleurs dorées, fonds et arrondis</div>
                        </div>
                      </div>
                      <button type="button" onClick={resetThemeColors} className="btn-reset">
                        <Glyph name="rotate" size={13} />
                        Réinitialiser aux couleurs d'origine
                      </button>
                    </div>
                    <div className="config-section__body">
                      <div className="swatch-grid">
                        {COLOR_SWATCHES.map(({ key, label, def, hint }) => (
                          <div key={key} className="swatch-card">
                            <label>{label}</label>
                            <div className="swatch-row">
                              <input type="color" value={themeForm[key] || def} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} />
                              <input type="text" value={themeForm[key] || def} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} placeholder={def} />
                            </div>
                            <div className="swatch-card__hint">{hint}</div>
                          </div>
                        ))}
                      </div>

                      <div className="radius-card">
                        <div className="radius-card__head">
                          <label>Arrondi des bordures</label>
                          <span className="radius-value">{themeForm.border_radius || 14}px</span>
                        </div>
                        <input type="range" min="4" max="28" value={themeForm.border_radius || 14} onChange={e => setThemeForm({ ...themeForm, border_radius: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                        <div className="radius-presets">
                          {RADIUS_PRESETS.map(r => (
                            <button key={r} type="button" onClick={() => setThemeForm({ ...themeForm, border_radius: r })} className={`radius-preset ${themeForm.border_radius === r ? 'radius-preset--active' : ''}`}>
                              {r}px
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── TEXTES & CMS ── */}
                  <section id="cfg-cms" className="config-section">
                    <div className="config-section__head">
                      <div className="config-section__head-left">
                        <span className="config-section__icon"><Glyph name="file-text" size={17} /></span>
                        <div>
                          <div className="config-section__title">Textes globaux & CMS</div>
                          <div className="config-section__desc">Contenus de la page d'accueil et contacts</div>
                        </div>
                      </div>
                    </div>
                    <div className="config-section__body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div className="field">
                        <label>Titre principal (hero title)</label>
                        <input type="text" value={themeForm.hero_title || ''} onChange={e => setThemeForm({ ...themeForm, hero_title: e.target.value })} placeholder="Ex : Trouvez la propriété de vos rêves au Cameroun" />
                      </div>
                      <div className="field">
                        <label>Sous-titre (hero subtitle)</label>
                        <textarea value={themeForm.hero_subtitle || ''} onChange={e => setThemeForm({ ...themeForm, hero_subtitle: e.target.value })} rows={2} placeholder="Sous-titre d'accueil…" />
                      </div>
                      <div className="field-grid">
                        <div className="field">
                          <label>Email de contact officiel</label>
                          <input type="email" value={themeForm.contact_email || ''} onChange={e => setThemeForm({ ...themeForm, contact_email: e.target.value })} placeholder="contact@piolo.cm" />
                        </div>
                        <div className="field">
                          <label>Numéro WhatsApp support</label>
                          <input type="text" value={themeForm.whatsapp_number || ''} onChange={e => setThemeForm({ ...themeForm, whatsapp_number: e.target.value })} placeholder="+237658324285" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── FEATURE FLAGS ── */}
                  <FeatureFlagSettings themeForm={themeForm} setThemeForm={setThemeForm} />

                  {/* ── INTÉGRATIONS API ── */}
                  <IntegrationSettings themeForm={themeForm} setThemeForm={setThemeForm} />

                  {/* ── NOTIFICATIONS CENTRALISÉES ── */}
                  <NotificationSettings themeForm={themeForm} setThemeForm={setThemeForm} />

                  {/* ── RÈGLES IMMOBILIÈRES ── */}
                  <RealEstateSettings themeForm={themeForm} setThemeForm={setThemeForm} />

                  {/* ── FINANCES & TARIFS ── */}
                  <FinancialSettings themeForm={themeForm} setThemeForm={setThemeForm} />

                  {/* ── RÔLES ADMIN ── */}
                  <RolesSettings />

                  {/* ── PARAMÈTRES MÉTIER & MAINTENANCE ── */}
                  <section id="cfg-settings" className="config-section">
                    <div className="config-section__head">
                      <div className="config-section__head-left">
                        <span className="config-section__icon"><Glyph name="settings" size={17} /></span>
                        <div>
                          <div className="config-section__title">Paramètres métier & Maintenance</div>
                          <div className="config-section__desc">Points de bienvenue et mode maintenance</div>
                        </div>
                      </div>
                    </div>
                    <div className="config-section__body">
                      <div className="stat-grid">
                        <div className="stat-card">
                          <label><Glyph name="home" size={14} /> Points bienvenue locataire</label>
                          <input type="number" value={themeForm.welcome_points_tenant || 50} onChange={e => setThemeForm({ ...themeForm, welcome_points_tenant: parseInt(e.target.value) })} />
                        </div>
                        <div className="stat-card">
                          <label><Glyph name="building" size={14} /> Points bienvenue bailleur</label>
                          <input type="number" value={themeForm.welcome_points_landlord || 30} onChange={e => setThemeForm({ ...themeForm, welcome_points_landlord: parseInt(e.target.value) })} />
                        </div>
                      </div>

                      <div className={`maintenance-box ${themeForm.maintenance_mode ? 'maintenance-box--active' : ''}`}>
                        <div className="maintenance-box__row" onClick={() => setThemeForm({ ...themeForm, maintenance_mode: !themeForm.maintenance_mode })}>
                          <Toggle checked={!!themeForm.maintenance_mode} danger onChange={(v) => setThemeForm({ ...themeForm, maintenance_mode: v })} />
                          <div>
                            <div className={`maintenance-box__title ${themeForm.maintenance_mode ? 'maintenance-box__title--active' : ''}`}>
                              <Glyph name={themeForm.maintenance_mode ? 'alert' : 'check-circle'} size={16} />
                              {themeForm.maintenance_mode ? 'Mode maintenance actif' : 'Plateforme opérationnelle'}
                            </div>
                            <div className="maintenance-box__desc">
                              {themeForm.maintenance_mode ? 'Les utilisateurs voient un message de maintenance' : 'Cliquez pour activer le mode maintenance'}
                            </div>
                          </div>
                        </div>
                        {themeForm.maintenance_mode && (
                          <div className="field" style={{ marginTop: 14 }}>
                            <label>Message affiché aux utilisateurs</label>
                            <textarea value={themeForm.maintenance_message || ''} onChange={e => setThemeForm({ ...themeForm, maintenance_message: e.target.value })} rows={2} />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <button type="submit" className="btn-save-bottom">
                    <Glyph name="save" size={17} />
                    Sauvegarder & appliquer toute la configuration en direct
                  </button>

                </div>
              </div>
            </form>

            {/* Modals de Prévisualisation et d'Historique */}
            <ConfigPreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              themeForm={themeForm}
              originalTheme={originalTheme}
              onPublish={() => {
                setIsPreviewOpen(false);
                document.getElementById('theme-config-form').requestSubmit();
              }}
            />

            <ConfigHistoryModal
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              onRollbackSuccess={fetchAdminData}
            />
          </div>
        )}
      </main>

      {/* Modal Rejet Dossier */}
      {rejectionModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectionModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--ink)' }}>Rejet du dossier de certification</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
              Sélectionnez un motif prédéfini ou rédigez une explication pour notifier le bailleur.
            </p>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)' }}>Motifs fréquents (clic rapide) :</label>
              <div className="rejection-presets">
                {[
                  { icon: 'camera', label: 'Photo illisible ou floue', text: 'Photo de la pièce d’identité illisible ou trop floue. Veuillez fournir un scan ou une photo nette et lisible.' },
                  { icon: 'calendar', label: 'Pièce expirée', text: 'La pièce d’identité fournie est expirée. Merci de soumettre un document officiel en cours de validité.' },
                  { icon: 'user', label: 'Selfie non conforme', text: 'Le selfie d’identification ne permet pas de reconnaître clairement le visage. Merci de reprendre une photo nette et bien éclairée.' },
                  { icon: 'alert', label: 'Discordance d’identité', text: 'Le nom indiqué sur le compte bailleur ne correspond pas aux mentions de la pièce d’identité fournie.' },
                  { icon: 'file', label: 'Verso manquant', text: 'Le verso de la pièce d’identité est manquant, tronqué ou illisible.' },
                  { icon: 'building', label: 'Justificatifs incomplets', text: 'Les justificatifs de propriété ou mandats de gestion sont incomplets pour finaliser la certification.' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="rejection-preset-chip"
                    onClick={() => setRejectReason(preset.text)}
                  >
                    <KycIcon name={preset.icon} size={13} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', display: 'block', marginTop: 12 }}>Message au bailleur :</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Expliquez clairement la raison du rejet afin que le bailleur puisse soumettre une pièce valide..."
              rows={4}
              style={{ width: '100%', marginTop: 6, borderRadius: 10, padding: 12, border: '1px solid var(--line)', outline: 'none', fontFamily: 'inherit', fontSize: 13 }}
            />

            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button onClick={() => setRejectionModalOpen(false)} className="btn btn-ghost">Annuler</button>
              <button onClick={handleRejectDossierSubmit} className="btn" style={{ background: 'var(--red)', color: '#fff', border: 'none' }}>
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation générique */}
      {confirmState && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmer cette action</h3>
            <p>{confirmState.message}</p>
            <div className="modal-actions">
              <button onClick={() => setConfirmState(null)} className="btn btn-ghost">Annuler</button>
              <button
                onClick={() => { confirmState.onConfirm(); setConfirmState(null); }}
                className="btn"
                style={{ background: 'var(--red)', color: '#fff' }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="modal-overlay" onClick={() => !userSaving && setUserModalOpen(false)}>
          <form className="modal" onSubmit={handleCreateUser} onClick={(e) => e.stopPropagation()}>
            <h3>Ajouter un utilisateur</h3>
            <p>Créez un compte Piolo et attribuez-lui immédiatement son espace de travail.</p>
            <div className="form-grid-2">
              {[
                ['first_name', 'Prénom', 'text'], ['last_name', 'Nom', 'text'],
                ['email', 'Adresse email', 'email'], ['phone', 'Téléphone', 'tel'],
                ['city', 'Ville', 'text'], ['password', 'Mot de passe', 'password'],
              ].map(([key, label, type]) => (
                <label key={key} className="form-label">{label}
                  <input required={['first_name', 'last_name', 'email', 'password'].includes(key)} type={type} value={userForm[key]} onChange={(e) => setUserForm((prev) => ({ ...prev, [key]: e.target.value }))} />
                </label>
              ))}
              <label className="form-label">Rôle
                <select value={userForm.role} onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}>
                  <option value="LOCATAIRE">Locataire</option><option value="BAILLEUR">Bailleur</option><option value="ARCHITECTE">Architecte</option><option value="ADMIN">Administrateur</option>
                </select>
              </label>
              <label className="form-label">Statut
                <select value={userForm.status} onChange={(e) => setUserForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="ACTIVE">Actif</option><option value="PENDING">En attente</option><option value="SUSPENDED">Suspendu</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setUserModalOpen(false)} className="btn btn-ghost" disabled={userSaving}>Annuler</button>
              <button type="submit" className="btn btn-gold" disabled={userSaving}>{userSaving ? 'Création…' : 'Créer le compte'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox documents KYC */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-stage" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Fermer">
              <KycIcon name="x" size={18} />
            </button>
            {lightbox.docs[lightbox.index].src?.toLowerCase().includes('.pdf') ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', background: '#1c1917', borderRadius: 12, color: '#fff', maxWidth: 420 }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Document au format PDF</div>
                <div style={{ fontSize: 13, color: '#a8a29e', marginBottom: 20 }}>Ce document justificatif a été fourni au format PDF.</div>
                <a
                  href={lightbox.docs[lightbox.index].src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', textDecoration: 'none', color: '#000', fontWeight: 700, borderRadius: 8 }}
                >
                  <span>Ouvrir / Télécharger le PDF</span>
                  <span>↗</span>
                </a>
              </div>
            ) : (
              <img
                src={lightbox.docs[lightbox.index].src}
                alt={lightbox.docs[lightbox.index].label}
                loading="eager"
                decoding="sync"
              />
            )}
            <div className="lightbox-nav">
              {lightbox.docs.length > 1 && (
                <button className="lightbox-arrow" onClick={() => setLightbox(l => ({ ...l, index: (l.index - 1 + l.docs.length) % l.docs.length }))} aria-label="Document précédent">‹</button>
              )}
              <span className="lightbox-caption">{lightbox.docs[lightbox.index].label} · {lightbox.index + 1}/{lightbox.docs.length}</span>
              {lightbox.docs.length > 1 && (
                <button className="lightbox-arrow" onClick={() => setLightbox(l => ({ ...l, index: (l.index + 1) % l.docs.length }))} aria-label="Document suivant">›</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
