// src/pages/properties/PropertyCreate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CREATE_STYLES = `
  .create-page-scope {
    --or: #D4AF37; --or-d: #B8962A;
    --noir: #1A1A1A; --gris: #555; --gris-b: #E8E4DC;
    --bg: #F8F9FA;
    background-color: var(--bg);
    min-height: 100vh;
    padding: 40px 20px 80px;
    font-family: 'DM Sans', sans-serif;
  }
  .create-shell {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
    overflow: hidden;
  }
  .create-header {
    background: var(--noir);
    color: #fff;
    padding: 30px 40px;
  }
  .create-header h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    margin-bottom: 8px;
    color: var(--or);
  }
  .create-progress {
    display: flex;
    justify-content: space-between;
    padding: 20px 40px;
    background: #FAFAFA;
    border-bottom: 1px solid var(--gris-b);
  }
  .step-indicator {
    font-size: 14px;
    font-weight: 600;
    color: var(--gris);
  }
  .step-indicator.active {
    color: var(--or-d);
  }
  .create-form {
    padding: 40px;
  }
  .form-group {
    margin-bottom: 24px;
  }
  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--noir);
  }
  .form-control {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--gris-b);
    border-radius: 12px;
    font-family: inherit;
    font-size: 15px;
  }
  .form-control:focus {
    outline: none;
    border-color: var(--or);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .btn-nav {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .btn-prev { background: #f0f0f0; color: var(--noir); }
  .btn-next { background: var(--noir); color: #fff; }
  .btn-next:hover { background: var(--or); }
  .nav-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid var(--gris-b);
  }
  .amenities-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .amenity-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .upload-box {
    border: 2px dashed var(--or);
    background: #FFFBF0;
    border-radius: 16px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 20px;
  }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .gallery-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    height: 120px;
    cursor: grab;
  }
  .gallery-item img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .gallery-item .remove-btn {
    position: absolute; top: 4px; right: 4px;
    background: rgba(0,0,0,0.6); color: white;
    border: none; border-radius: 50%; width: 24px; height: 24px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .dragging { opacity: 0.5; }
`;

export default function PropertyCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '', transaction_type: '', property_type: '', price: '', price_negotiable: false,
    avance_mois: 0, caution_mois: 0, description: '',
    address: '', city: '', neighborhood: '', latitude: '', longitude: '',
    area: '', bedrooms: 0, bathrooms: 1,
    furnished: false, balcony: false, parking: false, security: false, water: true, electricity: true
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState([]); // { id, file, url }
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (!user || (user.role !== 'BAILLEUR' && user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSecondaryImages = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file)
    }));
    setSecondaryImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10
  };

  const removeSecondary = (id) => {
    setSecondaryImages(prev => prev.filter(img => img.id !== id));
  };

  // Drag and drop for reordering
  const handleSort = () => {
    const _secondaryImages = [...secondaryImages];
    const draggedItemContent = _secondaryImages.splice(dragItem.current, 1)[0];
    _secondaryImages.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setSecondaryImages(_secondaryImages);
  };

  const nextStep = () => {
    // Basic validation before next
    if (step === 1 && (!formData.title || !formData.transaction_type || !formData.property_type || !formData.price || !formData.description)) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (step === 2 && (!formData.address || !formData.city)) {
      setError('Adresse et ville sont obligatoires.');
      return;
    }
    if (step === 3 && !formData.area) {
      setError('La surface est obligatoire.');
      return;
    }
    if (step === 4 && !mainImage) {
      setError('L\'image principale est obligatoire.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      data.append('main_image', mainImage);
      secondaryImages.forEach((img) => {
        data.append('secondary_images', img.file);
      });
      data.append('is_published', 'false'); // Need admin review
      data.append('status', 'PENDING');

      const res = await api.post('/properties/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data) {
        // Signal au dashboard pour afficher la modale conciergerie (douce suggestion post-publication)
        navigate('/accounts/dashboard', { state: { justPublished: true, propertyTitle: res.data.title || '' } });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la publication.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page-scope">
      <style>{CREATE_STYLES}</style>
      <div className="create-shell">
        <header className="create-header">
          <h1>Publier une nouvelle annonce</h1>
          <p>Remplissez les informations ci-dessous pour publier votre bien sur Piolo.</p>
        </header>

        <div className="create-progress">
          {[1,2,3,4,5].map(num => (
            <div key={num} className={`step-indicator ${step >= num ? 'active' : ''}`}>
              Étape {num}
            </div>
          ))}
        </div>

        <div className="create-form">
          {error && <div style={{color:'red', marginBottom:'20px', padding:'10px', background:'#fee'}}>{error}</div>}

          {step === 1 && (
            <div>
              <h3>Informations de base</h3>
              <div className="form-group">
                <label>Titre de l'annonce *</label>
                <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type de transaction *</label>
                  <select name="transaction_type" className="form-control" value={formData.transaction_type} onChange={handleChange}>
                    <option value="">Sélectionner...</option>
                    <option value="LOCATION">Location</option>
                    <option value="VENTE">Vente</option>
                    <option value="COURTE_DUREE">Courte durée</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de bien *</label>
                  <select name="property_type" className="form-control" value={formData.property_type} onChange={handleChange}>
                    <option value="">Sélectionner...</option>
                    <option value="APPARTEMENT">Appartement</option>
                    <option value="VILLA">Villa</option>
                    <option value="STUDIO">Studio</option>
                    <option value="TERRAIN">Terrain</option>
                    <option value="BUREAU">Bureau</option>
                    <option value="BOUTIQUE">Boutique</option>
                    <option value="IMMEUBLE">Immeuble</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Loyer / Prix (FCFA) *</label>
                <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" className="form-control" rows="5" value={formData.description} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>Localisation du bien</h3>
              <div className="form-group">
                <label>Adresse complète *</label>
                <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ville *</label>
                  <select name="city" className="form-control" value={formData.city} onChange={handleChange}>
                    <option value="">Sélectionner...</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Douala">Douala</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Garoua">Garoua</option>
                    <option value="Maroua">Maroua</option>
                    <option value="Kribi">Kribi</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quartier</label>
                  <input type="text" name="neighborhood" className="form-control" value={formData.neighborhood} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>Caractéristiques du bien</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Surface (m²) *</label>
                  <input type="number" name="area" className="form-control" value={formData.area} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Chambres</label>
                  <input type="number" name="bedrooms" className="form-control" value={formData.bedrooms} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Salles de bain</label>
                  <input type="number" name="bathrooms" className="form-control" value={formData.bathrooms} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Équipements</label>
                <div className="amenities-grid">
                  {['furnished', 'balcony', 'parking', 'security', 'water', 'electricity'].map(am => (
                    <label key={am} className="amenity-label">
                      <input type="checkbox" name={am} checked={formData[am]} onChange={handleChange} />
                      {am}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3>Photos du bien</h3>
              <div className="form-group">
                <label>Image principale *</label>
                <label className="upload-box" style={{display:'block'}}>
                  <input type="file" hidden accept="image/*" onChange={handleMainImage} />
                  {mainImagePreview ? (
                    <img src={mainImagePreview} alt="Preview" style={{maxHeight:'200px', borderRadius:'12px'}} />
                  ) : (
                    <div>Cliquez pour ajouter une image</div>
                  )}
                </label>
              </div>
              <div className="form-group">
                <label>Galerie photos ({secondaryImages.length}/10)</label>
                <input type="file" multiple accept="image/*" onChange={handleSecondaryImages} />
                <div className="gallery-grid">
                  {secondaryImages.map((img, index) => (
                    <div 
                      key={img.id} 
                      className="gallery-item"
                      draggable
                      onDragStart={(e) => (dragItem.current = index)}
                      onDragEnter={(e) => (dragOverItem.current = index)}
                      onDragEnd={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <img src={img.url} alt="Gallery" />
                      <button className="remove-btn" type="button" onClick={() => removeSecondary(img.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3>Vérifier et publier</h3>
              <div style={{background:'#fafafa', padding:'20px', borderRadius:'12px'}}>
                <p><strong>Titre:</strong> {formData.title}</p>
                <p><strong>Prix:</strong> {formData.price} FCFA</p>
                <p><strong>Ville:</strong> {formData.city}</p>
                <p><strong>Surface:</strong> {formData.area} m²</p>
              </div>
              <p style={{marginTop:'20px'}}>
                Votre annonce sera soumise et examinée par notre équipe avant d'être publiée définitivement.
              </p>
            </div>
          )}

          <div className="nav-actions">
            <button className="btn-nav btn-prev" onClick={prevStep} disabled={step === 1 || loading}>Retour</button>
            {step < 5 ? (
              <button className="btn-nav btn-next" onClick={nextStep}>Suivant</button>
            ) : (
              <button className="btn-nav btn-next" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Publication...' : 'Publier mon annonce'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
