import Glyph from '../components/Glyph';

export default function NotificationSettings({ themeForm, setThemeForm }) {
  const notifs = themeForm.notifications_config || {};

  const toggleChannel = (key) => {
    setThemeForm({
      ...themeForm,
      notifications_config: {
        ...notifs,
        [key]: notifs[key] === false ? true : false,
      },
    });
  };

  const channelGroups = [
    {
      title: '1. Notifications Transactions & KYC',
      items: [
        { key: 'email_welcome', name: 'Email de bienvenue & Confirmation de compte', channel: 'Email' },
        { key: 'email_kyc_approved', name: 'Notification validation / rejet dossier KYC bailleur', channel: 'Email & In-App' },
        { key: 'email_delegated_mgmt', name: 'Alerte souscription "Gestion Déléguée & Clé en Main"', channel: 'Email Admin' },
        { key: 'escrow_milestone_alert', name: 'Notification séquestre Piolo Protec (Acompte / Validation)', channel: 'Email & Push' },
      ],
    },
    {
      title: '2. Messagerie & Alertes Visites',
      items: [
        { key: 'sms_visit_reminder', name: 'Rappel SMS automatique 2h avant le rendez-vous de visite', channel: 'SMS' },
        { key: 'whatsapp_new_message', name: 'Alerte WhatsApp lors d\'un nouveau message bailleur', channel: 'WhatsApp' },
        { key: 'inapp_search_alert', name: 'Push notification instantanée pour alertes de recherche', channel: 'Push In-App' },
        { key: 'email_price_drop', name: 'Email automatique lors d\'une baisse de prix sur un bien favori', channel: 'Email' },
      ],
    },
  ];

  return (
    <div id="cfg-notifications" className="config-section">
      <div className="config-section__head">
        <div className="config-section__head-left">
          <span className="config-section__icon"><Glyph name="bell" size={17} /></span>
          <div>
            <div className="config-section__title">Notifications Centralisées &amp; Déclencheurs d'Événements</div>
            <div className="config-section__desc">Gérez l'ensemble des flux d'information automatisés par Email, SMS et WhatsApp.</div>
          </div>
        </div>
      </div>
      <div className="config-section__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {channelGroups.map(group => (
            <div key={group.title}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 10 }}>
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.items.map(c => {
                  const isEnabled = notifs[c.key] !== false;
                  return (
                    <div
                      key={c.key}
                      style={{
                        background: 'var(--paper)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--gold-deep)', fontWeight: 700, marginTop: 2 }}>Canal : {c.channel}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleChannel(c.key)}
                        style={{
                          background: isEnabled ? 'rgba(47,107,79,0.12)' : 'var(--card)',
                          border: `1px solid ${isEnabled ? 'var(--green)' : 'var(--line)'}`,
                          color: isEnabled ? 'var(--green)' : 'var(--ink-soft)',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0,
                          transition: 'all .15s ease',
                        }}
                      >
                        <Glyph name={isEnabled ? 'check-circle' : 'alert'} size={13} />
                        <span>{isEnabled ? 'Actif' : 'Désactivé'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
