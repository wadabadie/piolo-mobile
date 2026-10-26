import { useState, useEffect } from 'react';
import api from '../../../services/api';
import Glyph from './Glyph';

export default function ConfigHistoryModal({ isOpen, onClose, onRollbackSuccess }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin-theme/history/');
      setHistory(res.data.history || []);
    } catch (e) {
      console.error("Erreur historique config:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (item) => {
    if (!window.confirm(`Confirmer la restauration de la version v${item.version} (${item.summary}) ?`)) return;
    setRestoringId(item.id);
    try {
      const res = await api.post('/auth/admin-theme/history/', { version_id: item.id });
      alert(res.data.message || 'Restauration effectuée !');
      if (onRollbackSuccess) onRollbackSuccess();
      onClose();
    } catch (e) {
      alert("Erreur lors de la restauration.");
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 13, 9, 0.82)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card, #fff)', border: '1px solid var(--line, #E6E0D1)', borderRadius: 20, maxWidth: 680, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line, #E6E0D1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.15)', color: 'var(--gold, #D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Glyph name="history" size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>Historique d'Audit &amp; Versions</h3>
              <span style={{ fontSize: 12, color: 'var(--ink-soft, #726A57)' }}>Consultez et restaurez n'importe quelle ancienne configuration</span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--ink)' }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-soft)' }}>Chargement de l'historique...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-soft)', background: 'var(--paper)', borderRadius: 14 }}>
              Aucun historique enregistré pour l'instant. Toutes vos modifications sauvegardées apparaîtront ici.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {history.map((h) => (
                <div key={h.id} style={{ background: 'var(--paper, #F7F4EC)', border: '1px solid var(--line, #E6E0D1)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#1C1811', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
                        v{h.version}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{h.summary}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                      Par <b>{h.author_name}</b> · {h.created_at}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={restoringId === h.id}
                    onClick={() => handleRollback(h)}
                    style={{
                      background: 'var(--card, #fff)', border: '1px solid var(--gold, #D4AF37)', color: 'var(--gold-deep, #AA820A)',
                      padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <Glyph name="rotate" size={13} />
                    {restoringId === h.id ? 'Restauration...' : 'Restaurer'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
