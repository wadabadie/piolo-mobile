import { useState } from 'react';
import api from '../../../services/api';
import Glyph from '../components/Glyph';

export default function IntegrationSettings() {
  const [testingService, setTestingService] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const services = [
    { key: 'google_maps', name: 'Google Maps Places & Geocoding' },
    { key: 'smtp', name: 'Service e-mail SMTP' },
    { key: 'messaging', name: 'Notifications de messagerie' },
  ];

  const handleTestConnection = async (service) => {
    setTestingService(service);
    setTestResult(null);
    try {
      const { data } = await api.post('/auth/admin-theme/test-connection/', { service });
      setTestResult(data);
    } catch {
      setTestResult({ ok: false, message: 'Échec de connexion au service.' });
    } finally {
      setTestingService(null);
    }
  };

  return (
    <div id="cfg-integrations" className="config-section">
      <div className="config-section__head">
        <div className="config-section__head-left">
          <span className="config-section__icon"><Glyph name="lock" size={17} /></span>
          <div>
            <div className="config-section__title">Sécurité des intégrations</div>
            <div className="config-section__desc">Les clés restent protégées côté serveur et ne sont jamais affichées dans le navigateur.</div>
          </div>
        </div>
      </div>
      <div className="config-section__body">
        {testResult && (
          <div className="config-status" role="status">
            <span>{testResult.message}</span>
            <button type="button" onClick={() => setTestResult(null)} aria-label="Fermer">×</button>
          </div>
        )}
        <div className="field-grid">
          {services.map((service) => (
            <div key={service.key} className="field">
              <label>{service.name}</label>
              <button
                type="button"
                className="btn-reset"
                disabled={testingService === service.key}
                onClick={() => handleTestConnection(service.key)}
              >
                <Glyph name="zap" size={12} />
                {testingService === service.key ? 'Test…' : 'Tester la connexion'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
