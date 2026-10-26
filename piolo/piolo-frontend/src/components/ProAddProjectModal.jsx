import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

/**
 * Modal Création de Projet / Chantier pour Professionnels
 * Permet l'upload de photo Avant, photo Après, et jusqu'à 6 photos supplémentaires de galerie
 */
export default function ProAddProjectModal({ onClose, onSaveProject }) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add('pro-modal-open', 'modal-open');
    return () => {
      const remaining = document.querySelectorAll('.pro-modal-backdrop');
      if (remaining.length <= 1) {
        document.body.classList.remove('pro-modal-open', 'modal-open');
      }
    };
  }, []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Menuiserie & Mobilier sur-mesure');
  const [city, setCity] = useState('Yaoundé, Bastos');
  const [duration, setDuration] = useState('10 jours');
  const [budget, setBudget] = useState('');
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [projectVideos, setProjectVideos] = useState([]);
  const [materials, setMaterials] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const MAX_GALLERY_PHOTOS = 6;
  const MAX_VIDEOS = 3;

  const handleFileUpload = (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 8 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'before') setBeforeImage(reader.result);
      if (target === 'after') setAfterImage(reader.result);
      if (target === 'gallery') {
        if (galleryImages.length >= MAX_GALLERY_PHOTOS) {
          setError(`Limite de ${MAX_GALLERY_PHOTOS} photos de galerie atteinte.`);
          return;
        }
        setGalleryImages(prev => [...prev, reader.result]);
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (projectVideos.length + files.length > MAX_VIDEOS) {
      setError(`Vous pouvez ajouter jusqu'à ${MAX_VIDEOS} vidéos par chantier.`);
      return;
    }

    files.forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        setError('Chaque vidéo ne doit pas dépasser 50 Mo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectVideos(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: reader.result,
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: ''
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    setError('');
  };

  const handleRemoveVideo = (index) => {
    setProjectVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez indiquer un titre pour ce projet.');
      return;
    }
    if (!afterImage) {
      setError('Veuillez ajouter au moins la photo principale du résultat final (Après réalisation).');
      return;
    }

    const projectData = {
      id: Date.now(),
      title,
      category,
      city,
      duration: duration || '2 semaines',
      budget: budget ? `${parseInt(budget).toLocaleString('fr-FR')} FCFA` : 'Sur devis',
      image: afterImage,
      afterImage,
      beforeImage: beforeImage || null,
      galleryImages,
      gallery_images: galleryImages,
      gallery: [afterImage, ...(beforeImage ? [beforeImage] : []), ...galleryImages].map((img, idx) => ({
        id: idx + 1,
        url: img
      })),
      videos: projectVideos,
      materials: materials ? materials.split(',').map(m => m.trim()).filter(Boolean) : ['Matériaux nobles', 'Finitions sur-mesure'],
      description: description || 'Conception et réalisation de qualité supérieure respectant le cahier des charges du client.',
      date: 'Récemment livré',
      likes: 0
    };

    onSaveProject(projectData);
  };

  return (
    <div className="pro-modal-backdrop">
      <div className="pro-modal-card" style={{ maxWidth: 760 }}>
        
        {/* HEADER */}
        <div className="pro-modal-head" style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1A160F 100%)', padding: '20px 26px', color: '#FFFFFF', borderBottom: '1.5px solid #D4AF37', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', color: '#F6D365', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(212,175,55,0.3)', marginBottom: 4 }}>
              <span>{t('pro_modals.add_project.badge')}</span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: '#FFF' }}>
              Ajouter un Chantier / Projet Réalisé
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        {/* CORPS AVEC DÉFILEMENT */}
        <div className="pro-modal-body" style={{ padding: '24px 26px', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(231,76,60,0.1)', color: '#C0392B', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 18, border: '1px solid rgba(231,76,60,0.25)' }}>
                {error}
              </div>
            )}

            {/* TITRE ET CATÉGORIE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F0D09', marginBottom: 6, textTransform: 'uppercase' }}>
                  Titre du Projet / Meuble *
                </label>
                <input
                  type="text"
                  placeholder={t("pro_modals.add_project.title_placeholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E8E3DA', fontSize: 13.5, outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F0D09', marginBottom: 6, textTransform: 'uppercase' }}>
                  Corps d'état / Métier
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E8E3DA', fontSize: 13.5, outline: 'none', background: '#FFF' }}
                >
                  <option value="Menuiserie & Mobilier sur-mesure">{t('pro.categories.carpentry_custom')}</option>
                  <option value="Cuisiniste & Dressings">{t('pro.categories.kitchen')}</option>
                  <option value="Architecture & Plans 3D">{t('pro.categories.architecture_3d')}</option>
                  <option value="Rénovation & Finitions BTP">{t('pro.categories.renovation')}</option>
                  <option value="Carrelage & Faux Plafonds">{t('pro.categories.tiling')}</option>
                  <option value="Électricité & Éclairage LED">{t('pro.categories.electricity_led')}</option>
                  <option value="Plomberie & Sanitaires">{t('pro.categories.plumbing_sanitary')}</option>
                </select>
              </div>
            </div>

            {/* VILLE, DURÉE ET BUDGET */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                  Ville &amp; Quartier
                </label>
                <input
                  type="text"
                  placeholder={t("pro_modals.add_project.location_placeholder")}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                  Durée de réalisation
                </label>
                <input
                  type="text"
                  placeholder={t("pro_modals.add_project.duration_placeholder")}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                  Coût estimatif (FCFA)
                </label>
                <input
                  type="number"
                  placeholder={t("pro_modals.add_project.cost_placeholder")}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>

            {/* PHOTOS DU CHANTIER : AVANT / APRÈS */}
            <div style={{ background: '#FAF9F6', padding: '18px 20px', borderRadius: 18, border: '1px solid #E8E3DA', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F0D09', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37' }} />
                <span>{t('pro_modals.add_project.main_photos_title')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {/* Photo Avant */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#666', marginBottom: 6 }}>
                    Photo Avant Travaux (Optionnel mais recommandé)
                  </label>
                  {beforeImage ? (
                    <div style={{ position: 'relative', height: 140, borderRadius: 12, overflow: 'hidden', border: '2px solid #D4AF37' }}>
                      <img src={beforeImage} alt="Avant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setBeforeImage('')}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.75)', color: '#FFF', border: 'none', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 12 }}
                      >
                        ✕
                      </button>
                      <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(15,13,9,0.85)', color: '#FFF', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                        Avant travaux
                      </span>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, borderRadius: 12, border: '2px dashed #D5CEBF', background: '#FFF', cursor: 'pointer', padding: 12, textAlign: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#AA820A" style={{ marginBottom: 6 }}>
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0F0D09' }}>{t('pro_modals.add_project.add_before_photo')}</span>
                      <span style={{ fontSize: 10.5, color: '#888', marginTop: 2 }}>{t('pro_modals.add_project.before_photo_desc')}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'before')} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* Photo Après */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#0F0D09', marginBottom: 6 }}>
                    Photo Après Réalisation * (Photo Principale)
                  </label>
                  {afterImage ? (
                    <div style={{ position: 'relative', height: 140, borderRadius: 12, overflow: 'hidden', border: '2px solid #2ECC71' }}>
                      <img src={afterImage} alt="Après" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setAfterImage('')}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.75)', color: '#FFF', border: 'none', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 12 }}
                      >
                        ✕
                      </button>
                      <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(46,204,113,0.9)', color: '#FFF', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                        Après réalisation
                      </span>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, borderRadius: 12, border: '2px dashed #2ECC71', background: '#FFF', cursor: 'pointer', padding: 12, textAlign: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#2ECC71" style={{ marginBottom: 6 }}>
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0F0D09' }}>{t('pro_modals.add_project.add_after_photo')}</span>
                      <span style={{ fontSize: 10.5, color: '#888', marginTop: 2 }}>{t('pro_modals.add_project.after_photo_desc')}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'after')} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* GALERIE MULTI-PHOTOS SUPPLÉMENTAIRES */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#0F0D09', textTransform: 'uppercase' }}>
                  Galerie Photos Complémentaires ({galleryImages.length} / {MAX_GALLERY_PHOTOS} photos)
                </label>
                <span style={{ fontSize: 11, color: '#888' }}>{t('pro_modals.add_project.gallery_desc')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 10 }}>
                {galleryImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', height: 85, borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E3DA' }}>
                    <img src={img} alt={`Détail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#FFF', border: 'none', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {galleryImages.length < MAX_GALLERY_PHOTOS && (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 85, borderRadius: 10, border: '1.5px dashed #D5CEBF', background: '#FAF9F6', cursor: 'pointer', padding: 6, textAlign: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#888">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#555', marginTop: 4 }}>{t('pro_modals.add_project.add_photo_btn')}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'gallery')} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* SECTION VIDÉOS DE CHANTIER (VISITES & MODE DÉCOUVERTE) */}
            <div style={{ marginBottom: 20, background: '#FAF9F6', padding: '16px 18px', borderRadius: 14, border: '1.5px solid #E8E3DA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 800, color: '#0F0D09', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#D4AF37"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    <span>Vidéos du Chantier &amp; Visites Guidées ({projectVideos.length} / {MAX_VIDEOS})</span>
                  </label>
                  <span style={{ fontSize: 11, color: '#777' }}>{t('pro_modals.add_project.videos_desc')}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {projectVideos.map((vid, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #D4AF37', background: '#000' }}>
                    <video
                      src={vid.url}
                      controls
                      playsInline
                      style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(idx)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.8)', color: '#FFF', border: 'none', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                    >
                      ✕
                    </button>
                    <div style={{ padding: '6px 10px', background: '#0F0D09', color: '#FFF', fontSize: 11 }}>
                      <input
                        type="text"
                        placeholder={t("pro_modals.add_project.video_title_placeholder")}
                        value={vid.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjectVideos(prev => prev.map((v, i) => i === idx ? { ...v, title: val } : v));
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#F6D365', fontSize: 11, fontWeight: 700, outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}

                {projectVideos.length < MAX_VIDEOS && (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 155, borderRadius: 12, border: '2px dashed #D4AF37', background: '#FFF', cursor: 'pointer', padding: 12, textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#AA820A">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F0D09' }}>{t('pro_modals.add_project.add_video_btn')}</span>
                    <span style={{ fontSize: 10.5, color: '#888', marginTop: 2 }}>{t('pro_modals.add_project.video_upload_desc')}</span>
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={handleVideoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* MATÉRIAUX ET DESCRIPTION */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F0D09', marginBottom: 6, textTransform: 'uppercase' }}>
                Matériaux &amp; Composants (séparés par des virgules)
              </label>
              <input
                type="text"
                placeholder={t("pro_modals.add_project.materials_placeholder")}
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F0D09', marginBottom: 6, textTransform: 'uppercase' }}>
                Description détaillée des travaux
              </label>
              <textarea
                placeholder={t("pro_modals.add_project.description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', minHeight: 90, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            {/* BOUTONS D'ACTION */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid #E8E3DA', background: '#FAF9F6', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: '13px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                  color: '#0F0D09',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                }}
              >
                Publier le Chantier dans ma Vitrine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
