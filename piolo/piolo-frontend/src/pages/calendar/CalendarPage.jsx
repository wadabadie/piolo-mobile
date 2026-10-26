import { useTranslation } from 'react-i18next';
// src/pages/calendar/CalendarPage.jsx
// Planning & Calendrier — Visites & Disponibilités Courts Séjours (Meublés / Nuitées)
// Luxury Gold & Noir, 100% Responsive Mobile, Sans Stickers
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import MobileBottomNav from '../../components/MobileBottomNav';
import api, { bookingsApi, propertiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../utils/media';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function CalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [calendarMode, setCalendarMode] = useState('VISITS'); // 'VISITS' | 'STAYS'
  const [visits, setVisits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [shortStayProps, setShortStayProps] = useState([]);
  const [selectedStayPropId, setSelectedStayPropId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, CONFIRMED, PENDING, CANCELLED
  const [viewMode, setViewMode] = useState('CALENDAR'); // CALENDAR, LIST
  
  // Date navigation pour le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Modal de blocage de dates
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockPropId, setBlockPropId] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Indisponible (Hôte)');
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const isBailleur = user?.role === 'BAILLEUR' || user?.is_bailleur;
  const dashboardPath = isBailleur ? '/dashboard/bailleur' : '/dashboard/locataire';

  const fetchVisits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/properties/requests/visits/');
      const data = res.data?.results || res.data || [];
      setVisits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Erreur chargement planning:", err.message);
      setError("Impossible de charger le planning des visites.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShortStayData = async () => {
    try {
      const [bRes, pRes] = await Promise.all([
        bookingsApi.list().catch(() => ({ data: { results: [] } })),
        propertiesApi.list({ owner: 'mine', transaction_type: 'COURTE_DUREE' }).catch(() => ({ data: { results: [] } }))
      ]);
      setBookings(bRes.data?.results || []);
      const pList = pRes.data?.results || pRes.data || [];
      setShortStayProps(Array.isArray(pList) ? pList : []);
    } catch (e) {
      console.warn("Erreur chargement meublés:", e);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVisits();
      if (isBailleur) fetchShortStayData();
    }
  }, [user?.id, isBailleur]);

  // Helper pour extraire la date standard YYYY-MM-DD d'une visite
  const getVisitDateStr = (visit) => {
    const raw = visit.confirmed_date || visit.requested_date || visit.scheduled_date || visit.visit_date || visit.date;
    if (!raw) return '';
    return typeof raw === 'string' ? raw.slice(0, 10) : '';
  };

  // Grouper les visites par date
  const visitsByDate = useMemo(() => {
    const map = {};
    visits.forEach(v => {
      const d = getVisitDateStr(v);
      if (d) {
        if (!map[d]) map[d] = [];
        map[d].push(v);
      }
    });
    return map;
  }, [visits]);

  // Grouper les réservations & blocages de séjours par date
  const bookingsByDate = useMemo(() => {
    const map = {};
    const filtered = selectedStayPropId
      ? bookings.filter(b => String(b.property?.id) === String(selectedStayPropId))
      : bookings;

    filtered.forEach(b => {
      if (b.status === 'REFUSED' || b.status === 'CANCELLED') return;
      let d = new Date(b.check_in_date);
      const end = new Date(b.check_out_date);
      while (d < end) {
        const iso = d.toISOString().split('T')[0];
        if (!map[iso]) map[iso] = [];
        map[iso].push(b);
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [bookings, selectedStayPropId]);

  // Visites filtrées pour la vue liste
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (filter === 'ALL') return true;
      const s = (v.status || '').toUpperCase();
      if (filter === 'CONFIRMED') return s === 'CONFIRMED' || s === 'CONFIRMEE';
      if (filter === 'PENDING') return s === 'PENDING' || !s;
      if (filter === 'CANCELLED') return ['CANCELLED', 'ANNULEE', 'REFUSED', 'REFUSEE'].includes(s);
      return true;
    });
  }, [visits, filter]);

  // Visites du jour sélectionné
  const selectedDayVisits = useMemo(() => {
    if (!selectedDateStr) return [];
    const dayVisits = visitsByDate[selectedDateStr] || [];
    if (filter === 'ALL') return dayVisits;
    return dayVisits.filter(v => {
      const s = (v.status || '').toUpperCase();
      if (filter === 'CONFIRMED') return s === 'CONFIRMED' || s === 'CONFIRMEE';
      if (filter === 'PENDING') return s === 'PENDING' || !s;
      if (filter === 'CANCELLED') return ['CANCELLED', 'ANNULEE', 'REFUSED', 'REFUSEE'].includes(s);
      return true;
    });
  }, [visitsByDate, selectedDateStr, filter]);

  // Séjours / blocages du jour sélectionné
  const selectedDayStays = useMemo(() => {
    if (!selectedDateStr) return [];
    return bookingsByDate[selectedDateStr] || [];
  }, [bookingsByDate, selectedDateStr]);

  // Statistiques KPIs Visites
  const stats = useMemo(() => {
    const total = visits.length;
    const confirmed = visits.filter(v => ['CONFIRMED', 'CONFIRMEE'].includes((v.status || '').toUpperCase())).length;
    const pending = visits.filter(v => ['PENDING', ''].includes((v.status || '').toUpperCase()) || !v.status).length;
    const cancelled = visits.filter(v => ['CANCELLED', 'REFUSED', 'ANNULEE', 'REFUSEE'].includes((v.status || '').toUpperCase())).length;
    return { total, confirmed, pending, cancelled };
  }, [visits]);

  // Statistiques KPIs Séjours
  const stayStats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED' && !b.is_blocked_by_host);
    const pending = bookings.filter(b => b.status === 'PENDING');
    const blocked = bookings.filter(b => b.is_blocked_by_host);
    const totalNights = confirmed.reduce((acc, b) => acc + (b.nights_count || 0), 0);
    const totalRevenue = confirmed.reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);
    return { confirmed: confirmed.length, pending: pending.length, blocked: blocked.length, totalNights, totalRevenue };
  }, [bookings]);

  // Navigation calendrier
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calcul des cases de la grille calendaire
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        visits: visitsByDate[dateStr] || [],
        stays: bookingsByDate[dateStr] || []
      });
    }

    const totalDaysInMonth = lastDayOfMonth.getDate();
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: true,
        visits: visitsByDate[dateStr] || [],
        stays: bookingsByDate[dateStr] || []
      });
    }

    const remainingCells = 42 - days.length;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const d = new Date(currentYear, currentMonth + 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        visits: visitsByDate[dateStr] || [],
        stays: bookingsByDate[dateStr] || []
      });
    }

    return days;
  }, [currentYear, currentMonth, visitsByDate, bookingsByDate]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleUnblockDate = async (bookingId) => {
    if (!window.confirm("Voulez-vous débloquer ces dates ?")) return;
    try {
      await bookingsApi.delete(bookingId);
      setToastMsg("Dates débloquées avec succès.");
      fetchShortStayData();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du déblocage.");
    }
  };

  const handleCreateBlockDates = async (e) => {
    e.preventDefault();
    if (!blockPropId || !blockStart || !blockEnd) {
      alert("Veuillez sélectionner le logement meublé ainsi que les dates.");
      return;
    }
    setBlockingLoading(true);
    try {
      await bookingsApi.blockDates(blockPropId, {
        check_in_date: blockStart,
        check_out_date: blockEnd,
        block_reason: blockReason || 'Indisponible (Hôte)',
      });
      setToastMsg("Dates bloquées avec succès !");
      setBlockModalOpen(false);
      setBlockStart('');
      setBlockEnd('');
      fetchShortStayData();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du blocage.");
    } finally {
      setBlockingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'CONFIRMED' || s === 'CONFIRMEE') {
      return <span style={{ background: '#E8F5E9', color: '#1E7A47', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Confirmée</span>;
    }
    if (s === 'PENDING' || !s) {
      return <span style={{ background: '#FFF8E1', color: '#A8891C', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>En attente</span>;
    }
    return <span style={{ background: '#FBE9E7', color: '#B83232', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Annulée</span>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6' }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, padding: '24px 20px 80px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        {/* EN-TÊTE PRINCIPAL */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 20, padding: '20px 24px',
          background: 'linear-gradient(135deg, #0F0D09 0%, #1A1713 100%)',
          borderRadius: 20, boxShadow: '0 8px 30px rgba(15,13,9,0.12)', border: '1px solid rgba(212,175,55,0.2)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Link to={dashboardPath} style={{ color: '#D4AF37', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                ← Dashboard
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>
                {calendarMode === 'STAYS' ? 'Disponibilités Meublés' : 'Planning des Visites'}
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 800,
              color: '#F6D365', margin: 0, letterSpacing: '-0.3px'
            }}>
              {calendarMode === 'STAYS' ? 'Disponibilités Courts Séjours' : 'Planning des Visites'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '4px 0 0' }}>
              {calendarMode === 'STAYS'
                ? 'Gérez vos dates libres, réservées ou bloquées pour vos logements en courte durée'
                : 'Consultez, validez et organisez vos rendez-vous de visite en toute sérénité'
              }
            </p>
          </div>

          {/* VUE TOGGLE */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.08)', padding: 4, borderRadius: 14,
            border: '1px solid rgba(212,175,55,0.25)', backdropFilter: 'blur(8px)'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('CALENDAR')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: 0,
                background: viewMode === 'CALENDAR' ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'transparent',
                color: viewMode === 'CALENDAR' ? '#0F0D09' : '#FFFFFF',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .2s'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
              <span>{t('calendar.view_calendar')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: 0,
                background: viewMode === 'LIST' ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'transparent',
                color: viewMode === 'LIST' ? '#0F0D09' : '#FFFFFF',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .2s'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/></svg>
              <span>{t('calendar.view_list')}</span>
            </button>
          </div>
        </div>

        {/* COMMUTATEUR BAILLEUR : VISITES VS COURTE DURÉE */}
        {isBailleur && (
          <div style={{
            display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
            background: '#fff', padding: '8px 12px', borderRadius: 16, border: '1px solid #E8E3DA'
          }}>
            <button
              type="button"
              onClick={() => setCalendarMode('VISITS')}
              style={{
                padding: '9px 16px', borderRadius: 12, border: 'none',
                background: calendarMode === 'VISITS' ? '#0F0D09' : 'transparent',
                color: calendarMode === 'VISITS' ? '#F6D365' : '#64605A',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Visites Classiques ({visits.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setCalendarMode('STAYS')}
              style={{
                padding: '9px 16px', borderRadius: 12, border: 'none',
                background: calendarMode === 'STAYS' ? 'linear-gradient(135deg, #059669, #10B981)' : 'transparent',
                color: calendarMode === 'STAYS' ? '#fff' : '#64605A',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Disponibilités Courts Séjours ({bookings.length})</span>
            </button>

            {calendarMode === 'STAYS' && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <select
                  value={selectedStayPropId}
                  onChange={(e) => setSelectedStayPropId(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 10, border: '1.5px solid #10B981',
                    fontSize: 12.5, fontWeight: 700, background: '#F0FDF4', color: '#065F46', outline: 'none'
                  }}
                >
                  <option value="">Tous mes meublés ({shortTermProps.length})</option>
                  {shortTermProps.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (shortTermProps.length > 0 && !blockPropId) setBlockPropId(shortTermProps[0].id);
                    setBlockModalOpen(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '8px 14px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>{t('calendar.block_period_btn')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STATS KPIS */}
        {calendarMode === 'VISITS' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 22 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 11, color: '#9B9690', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t('calendar.stats.total_visits')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F0D09', marginTop: 4 }}>{stats.total}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(30,122,71,0.25)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 11, color: '#1E7A47', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t('calendar.stats.confirmed')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1E7A47', marginTop: 4 }}>{stats.confirmed}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 11, color: '#A8891C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>En attente</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#A8891C', marginTop: 4 }}>{stats.pending}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 11, color: '#9B9690', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t('calendar.stats.rejected')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#64605A', marginTop: 4 }}>{stats.cancelled}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 22 }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(16, 185, 129, 0.3)', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>{t('calendar.stats.reserved_nights')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#065F46', marginTop: 4 }}>{stayStats.totalNights} nuits</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: '#374151', fontWeight: 800, textTransform: 'uppercase' }}>{t('calendar.stats.confirmed_stays')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginTop: 4 }}>{stayStats.confirmed}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FCD34D', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: '#D97706', fontWeight: 800, textTransform: 'uppercase' }}>{t('calendar.stats.pending')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#B45309', marginTop: 4 }}>{stayStats.pending}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(139, 92, 246, 0.3)', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase' }}>{t('calendar.stats.blocked_periods')}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#6D28D9', marginTop: 4 }}>{stayStats.blocked}</div>
            </div>
          </div>
        )}

        {/* CALENDRIER VIEW */}
        {viewMode === 'CALENDAR' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 20, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              
              {/* EN-TÊTE MOIS + NAVIGATION */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0F0D09', fontFamily: 'Poppins, sans-serif' }}>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h2>
                  <button
                    type="button"
                    onClick={goToToday}
                    style={{
                      padding: '4px 10px', borderRadius: 8, border: '1px solid #E8E3DA',
                      background: '#FAF9F6', fontSize: 11, fontWeight: 700, color: '#0F0D09', cursor: 'pointer'
                    }}
                  >
                    Aujourd&apos;hui
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Mois précédent"
                    style={{
                      width: 34, height: 34, borderRadius: 10, border: '1px solid #E8E3DA',
                      background: '#FFFFFF', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#0F0D09'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Mois suivant"
                    style={{
                      width: 34, height: 34, borderRadius: 10, border: '1px solid #E8E3DA',
                      background: '#FFFFFF', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#0F0D09'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                </div>
              </div>

              {/* JOURS DE LA SEMAINE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: 8 }}>
                {DAYS_OF_WEEK.map((d, i) => (
                  <div key={d} style={{ fontSize: 12, fontWeight: 700, color: i >= 5 ? '#A8891C' : '#9B9690', padding: '6px 0' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* GRILLE DES JOURS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {calendarDays.map((cell, idx) => {
                  const isToday = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDateStr;

                  if (calendarMode === 'VISITS') {
                    const hasVisits = cell.visits.length > 0;
                    const hasConfirmed = cell.visits.some(v => ['CONFIRMED', 'CONFIRMEE'].includes((v.status || '').toUpperCase()));
                    const hasPending = cell.visits.some(v => ['PENDING', ''].includes((v.status || '').toUpperCase()) || !v.status);

                    return (
                      <button
                        key={`${cell.dateStr}-${idx}`}
                        type="button"
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        style={{
                          minHeight: 52, padding: '6px 4px', borderRadius: 12,
                          border: isSelected ? '2px solid #D4AF37' : isToday ? '1.5px solid #0F0D09' : '1px solid #F0ECE3',
                          background: isSelected ? 'rgba(212,175,55,0.12)' : cell.isCurrentMonth ? '#FFFFFF' : '#FAF9F6',
                          opacity: cell.isCurrentMonth ? 1 : 0.45, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{
                          fontSize: 12.5, fontWeight: isToday || isSelected ? 800 : 600,
                          width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
                          background: isToday ? '#0F0D09' : 'transparent', color: isToday ? '#FFFFFF' : cell.isCurrentMonth ? '#0F0D09' : '#9B9690'
                        }}>
                          {cell.dayNum}
                        </span>
                        {hasVisits && (
                          <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                            {hasConfirmed && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1E7A47' }} title="Confirmée" />}
                            {hasPending && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} title="En attente" />}
                          </div>
                        )}
                      </button>
                    );
                  }

                  // ── Mode STAYS (Disponibilités Courts Séjours) ──
                  const hasStays = cell.stays.length > 0;
                  const hasHostBlock = cell.stays.some(b => b.is_blocked_by_host);
                  const hasConfirmedStay = cell.stays.some(b => b.status === 'CONFIRMED' && !b.is_blocked_by_host);
                  const hasPendingStay = cell.stays.some(b => b.status === 'PENDING');

                  let cellBg = cell.isCurrentMonth ? '#FFFFFF' : '#FAF9F6';
                  let cellBorder = '1px solid #F0ECE3';

                  if (hasHostBlock) {
                    cellBg = 'rgba(139, 92, 246, 0.14)';
                    cellBorder = '1.5px solid #8B5CF6';
                  } else if (hasConfirmedStay) {
                    cellBg = 'rgba(239, 68, 68, 0.12)';
                    cellBorder = '1.5px solid #EF4444';
                  } else if (hasPendingStay) {
                    cellBg = 'rgba(245, 158, 11, 0.14)';
                    cellBorder = '1.5px solid #F59E0B';
                  } else if (cell.isCurrentMonth && new Date(cell.dateStr) >= new Date(todayStr)) {
                    cellBg = '#F0FDF4';
                    cellBorder = '1px solid rgba(16, 185, 129, 0.25)';
                  }

                  if (isSelected) {
                    cellBorder = '2.5px solid #059669';
                  }

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      style={{
                        minHeight: 56, padding: '6px 4px', borderRadius: 12,
                        border: cellBorder, background: cellBg,
                        opacity: cell.isCurrentMonth ? 1 : 0.4, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s ease', position: 'relative'
                      }}
                    >
                      <span style={{
                        fontSize: 12.5, fontWeight: isToday || isSelected ? 800 : 600,
                        width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
                        background: isToday ? '#0F0D09' : 'transparent', color: isToday ? '#FFFFFF' : '#0F0D09'
                      }}>
                        {cell.dayNum}
                      </span>

                      <div style={{ marginTop: 2, textAlign: 'center', width: '100%' }}>
                        {hasHostBlock ? (
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#6D28D9', display: 'block', background: '#EDE9FE', borderRadius: 4, padding: '1px 2px' }}>
                            Bloqué
                          </span>
                        ) : hasConfirmedStay ? (
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#B91C1C', display: 'block', background: '#FEE2E2', borderRadius: 4, padding: '1px 2px' }}>
                            Réservé
                          </span>
                        ) : hasPendingStay ? (
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#B45309', display: 'block', background: '#FEF3C7', borderRadius: 4, padding: '1px 2px' }}>
                            Option
                          </span>
                        ) : cell.isCurrentMonth && new Date(cell.dateStr) >= new Date(todayStr) ? (
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#059669' }}>
                            • Libre
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* LÉGENDE */}
              {calendarMode === 'VISITS' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginTop: 18, paddingTop: 14, borderTop: '1px solid #E8E3DA', fontSize: 11.5, color: '#64605A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1E7A47' }} />
                    <span>{t('calendar.statuses.confirmed_visit')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37' }} />
                    <span>{t('calendar.statuses.pending_validation')}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginTop: 18, paddingTop: 14, borderTop: '1px solid #E8E3DA', fontSize: 11.5, color: '#374151' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 4, background: '#D1FAE5', border: '1px solid #10B981' }} />
                    <span style={{ fontWeight: 600 }}>{t('calendar.statuses.available')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 4, background: '#FEE2E2', border: '1px solid #EF4444' }} />
                    <span style={{ fontWeight: 600 }}>{t('calendar.statuses.reserved')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 4, background: '#EDE9FE', border: '1px solid #8B5CF6' }} />
                    <span style={{ fontWeight: 600 }}>{t('calendar.statuses.blocked_host')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* DÉTAIL DU JOUR SÉLECTIONNÉ */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 20, padding: '22px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 2px', color: '#0F0D09', fontFamily: 'Poppins, sans-serif' }}>
                    {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Jour sélectionné'}
                  </h3>
                  <span style={{ fontSize: 12, color: '#9B9690' }}>
                    {calendarMode === 'VISITS'
                      ? `${selectedDayVisits.length} visite(s) programmée(s)`
                      : `${selectedDayStays.length} réservation(s) / blocage(s)`
                    }
                  </span>
                </div>

                {calendarMode === 'STAYS' && (
                  <button
                    type="button"
                    onClick={() => {
                      setBlockStart(selectedDateStr);
                      const nextDay = new Date(selectedDateStr);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setBlockEnd(nextDay.toISOString().split('T')[0]);
                      if (shortTermProps.length > 0 && !blockPropId) setBlockPropId(shortTermProps[0].id);
                      setBlockModalOpen(true);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                      border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>{t('calendar.block_from_date')}</span>
                  </button>
                )}
              </div>

              {calendarMode === 'VISITS' ? (
                selectedDayVisits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', background: '#FAF9F6', borderRadius: 16, border: '1px dashed #E8E3DA' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: '#0F0D09' }}>{t('calendar.no_visits_day')}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9B9690' }}>{t('calendar.select_date_hint')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedDayVisits.map(visit => {
                      const prop = visit.property_detail || visit.property || {};
                      const propImg = getMediaUrl(prop.main_image || prop.cover_image || '/img/property-placeholder.jpg');
                      const formattedTime = visit.confirmed_time || visit.requested_time || '10:00';

                      return (
                        <div key={visit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#FAF9F6', border: '1px solid #E8E3DA', borderRadius: 14, gap: 14, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                            <img src={propImg} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <span style={{ padding: '2px 7px', borderRadius: 6, background: '#0F0D09', color: '#F6D365', fontSize: 11, fontWeight: 800 }}>
                                  {formattedTime.slice(0, 5)}
                                </span>
                                {getStatusBadge(visit.status)}
                              </div>
                              <strong style={{ fontSize: 13.5, color: '#0F0D09' }}>{prop.title}</strong>
                              <div style={{ fontSize: 11.5, color: '#64605A' }}>
                                Locataire : {visit.tenant?.full_name || visit.tenant?.email}
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/dashboard/bailleur/visites/${visit.id}`}
                            style={{ padding: '7px 14px', borderRadius: 10, background: '#FFFFFF', border: '1px solid #D4AF37', color: '#0F0D09', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                          >
                            Voir détails →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Mode STAYS : Détail des séjours ou blocages du jour */
                selectedDayStays.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F0FDF4', borderRadius: 16, border: '1px dashed rgba(16, 185, 129, 0.4)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'grid', placeItems: 'center', margin: '0 auto 8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 14, color: '#065F46' }}>{t('calendar.property_available_day')}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#047857' }}>
                      Aucun séjour ni blocage enregistré pour cette date. Les voyageurs peuvent réserver.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedDayStays.map(b => {
                      const isBlocked = b.is_blocked_by_host;
                      const guestName = b.guest?.full_name || b.guest_name || 'Voyageur';
                      const guestPhone = b.guest?.phone || b.guest_phone || '';

                      return (
                        <div
                          key={b.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 16px',
                            background: isBlocked ? '#FAF5FF' : '#F0FDF4',
                            border: isBlocked ? '1px solid #D8B4FE' : '1px solid #A7F3D0',
                            borderRadius: 14, gap: 14, flexWrap: 'wrap'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: 6,
                                background: isBlocked ? '#7C3AED' : '#059669', color: '#fff',
                                fontSize: 11, fontWeight: 800
                              }}>
                                {isBlocked ? 'Bloqué hôte' : 'Séjour Confirmé'}
                              </span>
                              <strong style={{ fontSize: 14, color: '#111827' }}>
                                {isBlocked ? (b.block_reason || 'Indisponible') : guestName}
                              </strong>
                            </div>
                            <div style={{ fontSize: 12, color: '#4B5563' }}>
                              Logement : <strong>{b.property?.title}</strong> · Du <strong>{b.check_in_date}</strong> au <strong>{b.check_out_date}</strong> ({b.nights_count} nuits)
                            </div>
                            {!isBlocked && (
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#065F46', marginTop: 2 }}>
                                Total : {new Intl.NumberFormat('fr-FR').format(b.total_price || 0)} FCFA ({b.guests_count} personne{b.guests_count > 1 ? 's' : ''})
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            {isBlocked ? (
                              <button
                                type="button"
                                onClick={() => handleUnblockDate(b.id)}
                                style={{
                                  padding: '7px 14px', borderRadius: 10,
                                  background: '#DC2626', color: '#fff', border: 'none',
                                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                                  display: 'inline-flex', alignItems: 'center', gap: 5
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>{t('calendar.unblock_dates')}</span>
                              </button>
                            ) : guestPhone ? (
                              <a
                                href={`https://wa.me/${guestPhone.replace(/\D/g, '').startsWith('237') ? guestPhone.replace(/\D/g, '') : `237${guestPhone.replace(/\D/g, '')}`}?text=${encodeURIComponent(`Bonjour ${guestName}, à propos de votre séjour pour "${b.property?.title}"...`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '7px 14px', borderRadius: 10,
                                  background: '#25D366', color: '#fff', border: 'none',
                                  fontSize: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                                </svg>
                                <span>{t('calendar.chat_whatsapp')}</span>
                              </a>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* VUE LISTE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredVisits.map(visit => {
              const prop = visit.property_detail || visit.property || {};
              const propImg = getMediaUrl(prop.main_image || prop.cover_image || '/img/property-placeholder.jpg');
              const visitDateStr = getVisitDateStr(visit);
              const formattedDate = visitDateStr ? new Date(visitDateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'À fixer';
              const formattedTime = (visit.confirmed_time || visit.requested_time || '10:00').slice(0, 5);

              return (
                <div
                  key={visit.id}
                  style={{
                    background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16,
                    padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <img src={propImg} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                        {getStatusBadge(visit.status)}
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0F0D09', background: '#EAE5D9', padding: '2px 6px', borderRadius: 6 }}>
                          {formattedTime}
                        </span>
                      </div>
                      <strong style={{ fontSize: 14, color: '#0F0D09' }}>{prop.title}</strong>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64605A' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{formattedDate} · {prop.city}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/dashboard/bailleur/visites/${visit.id}`}
                    style={{
                      padding: '8px 14px', borderRadius: 10, background: '#FAF9F6',
                      border: '1px solid #D4AF37', color: '#0F0D09', fontSize: 12, fontWeight: 700, textDecoration: 'none'
                    }}
                  >
                    Détails →
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODALE DE BLOCAGE DE DATES */}
      {blockModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,13,9,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
            padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED',
                  display: 'grid', placeItems: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F0D09' }}>
                  Bloquer une période
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9B9690' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
              Sélectionnez les dates où votre meublé ne doit pas être réservable (travaux, séjour personnel, Airbnb, etc.).
            </p>

            <form onSubmit={handleCreateBlockDates}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
                  Logement meublé
                </label>
                <select
                  value={blockPropId}
                  onChange={(e) => setBlockPropId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                >
                  <option value="">{t('calendar.select_property')}</option>
                  {shortTermProps.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>
                    Date d&apos;arrivée
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>
                    Date de départ
                  </label>
                  <input
                    type="date"
                    min={blockStart || todayStr}
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
                  Motif du blocage
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                >
                  <option value="Indisponible (Hôte)">{t('calendar.statuses.unavailable_family')}</option>
                  <option value="Travaux ou Maintenance">{t('calendar.statuses.renovation')}</option>
                  <option value="Réservé hors plateforme">{t('calendar.statuses.external_booking')}</option>
                  <option value="{t('calendar.statuses.other')}">{t('calendar.statuses.other')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={blockingLoading}
                  style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    opacity: blockingLoading ? 0.7 : 1
                  }}
                >
                  {blockingLoading ? 'Enregistrement…' : 'Confirmer le blocage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: '#0F0D09', color: '#fff', padding: '12px 20px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderLeft: '4px solid #10B981',
          fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>✓ {toastMsg}</span>
          <button type="button" onClick={() => setToastMsg('')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', marginLeft: 6 }}>×</button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab="visites" />
    </div>
  );
}
