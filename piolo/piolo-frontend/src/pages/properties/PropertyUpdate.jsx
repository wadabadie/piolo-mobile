// src/pages/properties/PropertyUpdate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UPDATE_STYLES = `
  .update-page-scope {
    --or: #D4AF37; --or-d: #B8962A;
    --noir: #1A1A1A; --gris: #555; --gris-b: #E8E4DC;
    --rouge: #C0392B; --rouge-l: #FADBD8;
    --bg: #F8F9FA;
    background-color: var(--bg);
    min-height: 100vh;
    padding: 40px 20px 80px;
    font-family: 'DM Sans', sans-serif;
  }
  .update-shell {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
    overflow: hidden;
  }
  .update-header {
    background: var(--noir);
    color: #fff;
    padding: 30px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .update-header h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    margin-bottom: 4px;
    color: var(--or);
  }
  .update-form {
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
    outline: none; border-color: var(--or); box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
  .form-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
  .btn {
    padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
  }
  .btn-primary { background: var(--noir); color: #fff; }
  .btn-primary:hover { background: var(--or); }
  .btn-danger { background: var(--rouge-l); color: var(--rouge); }
  .btn-danger:hover { background: var(--rouge); color: #fff; }
  .btn-outline { background: transparent; border: 1px solid var(--gris-b); color: var(--noir); }
  .btn-outline:hover { background: #f0f0f0; }
  .nav-actions {
    display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--gris-b);
  }
  .amenities-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .gallery-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-top: 16px;
  }
  .gallery-item {
    position: relative; border-radius: 12px; overflow: hidden; height: 120px;
  }
  .gallery-item img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .gallery-item .remove-btn {
    position: absolute; top: 4px; right: 4px; background: rgba(200,50,50,0.8); color: white;
    border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;
  }
  .section-title {
    font-family: 'Poppins', sans-serif; font-size: 18px; margin: 30px 0 20px; border-bottom: 2px solid var(--gris-b); padding-bottom: 8px; color: var(--noir);
  }
  .danger-zone {
    margin-top: 50px; padding: 24px; border: 1px solid var(--rouge-l); border-radius: 16px; background: #fff5f5;
  }
  .danger-zone h3 { color: var(--rouge); margin-bottom: 10px; }
`;

export default function PropertyUpdate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [property, setProperty] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', transaction_type: '', property_type: '', price: '', price_negotiable: false,
    description: '', address: '', city: '', neighborhood: '', area: '', bedrooms: 0, bathrooms: 1,
    furnished: false, balcony: false, parking: false, security: false, water: true, electricity: true,
    status: ''
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  
  const [existingImages, setExistingImages] = useState([]); // from API
  const [newImages, setNewImages] = useState([]); // files to upload

  useEffect(() => {
    if (!user || (user.role !== 'BAILLEUR' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}/`);
        const p = res.data;
        setProperty(p);
        
        // Fill form data
        const fd = { ...formData };
        Object.keys(fd).forEach(key => {
          if (p[key] !== undefined) fd[key] = p[key];
        });
        setFormData(fd);
        
        if (p.main_image || p.cover_image) {
          setMainImagePreview(p.main_image || p.cover_image);
        }
        
        if (p.images) {
          setExistingImages(p.images);
        }
        
      } catch (err) {
        setError('Impossible de charger l\'annonce.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id, user, navigate]);

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

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file)
    }));
    setNewImages(prev => [...prev, ...mapped]);
  };

  const removeNewImage = (uid) => {
    setNewImages(prev => prev.filter(img => img.id !== uid));
  };

  const deleteExistingImage = async (imageId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette image ?')) return;
    try {
      await api.delete(`/properties/${id}/images/${imageId}/`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      alert('Erreur lors de la suppression de l\'image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (mainImage) {
        data.append('main_image', mainImage);
      }
      
      newImages.forEach(img => {
        data.append('secondary_images', img.file);
      });

      await api.patch(`/properties/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Annonce mise à jour avec succès !');
      navigate('/accounts/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT cette annonce ? Cette action est irréversible.")) {
      try {
        await api.delete(`/properties/${id}/`);
        navigate('/accounts/dashboard');
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleArchive = async () => {
    if (window.confirm("Voulez-vous archiver cette annonce ? Elle ne sera plus visible par les locataires.")) {
      try {
        await api.patch(`/properties/${id}/`, { status: 'ARCHIVED', is_published: false });
        navigate('/accounts/dashboard');
      } catch (err) {
        alert("Erreur lors de l'archivage.");
      }
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;

  return (
    <div className="update-page-scope">
      <style>{UPDATE_STYLES}</style>
      <div className="update-shell">
        <header className="update-header">
          <div>
            <h1>Modifier l'annonce</h1>
            <p style={{margin:0, opacity:0.8}}>ID: {id}</p>
          </div>
          <button className="btn btn-outline" style={{background:'#fff'}} onClick={() => navigate('/accounts/dashboard')}>
            Retour
          </button>
        </header>

        <form className="update-form" onSubmit={handleSubmit}>
          {error && <div style={{color:'red', marginBottom:'20px', padding:'10px', background:'#fee'}}>{error}</div>}

          <h3 className="section-title">Informations Générales</h3>
          <div className="form-group">
            <label>Titre</label>
            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Prix (FCFA)</label>
              <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Surface (m²)</label>
              <input type="number" name="area" className="form-control" value={formData.area} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" rows="5" value={formData.description} onChange={handleChange} required />
          </div>

          <h3 className="section-title">Photos</h3>
          <div className="form-group">
            <label>Image principale (remplacer)</label>
            <input type="file" accept="image/*" onChange={handleMainImage} style={{marginBottom: '10px'}} />
            {mainImagePreview && (
              <div><img src={mainImagePreview} alt="Principale" style={{maxHeight:'150px', borderRadius:'12px'}} /></div>
            )}
          </div>
          
          <div className="form-group">
            <label>Galerie - Images existantes</label>
            {existingImages.length === 0 ? <p>Aucune image secondaire.</p> : (
              <div className="gallery-grid">
                {existingImages.map(img => (
                  <div key={img.id} className="gallery-item">
                    <img src={img.image_url || img.image} alt="Gallery" />
                    <button type="button" className="remove-btn" onClick={() => deleteExistingImage(img.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Ajouter de nouvelles images à la galerie</label>
            <input type="file" multiple accept="image/*" onChange={handleNewImages} />
            <div className="gallery-grid">
              {newImages.map(img => (
                <div key={img.id} className="gallery-item">
                  <img src={img.url} alt="New Gallery" />
                  <button type="button" className="remove-btn" onClick={() => removeNewImage(img.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="nav-actions">
            <button type="button" className="btn btn-outline" onClick={handleArchive}>Archiver l'annonce</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
          
          <div className="danger-zone">
            <h3>Zone de danger</h3>
            <p>La suppression d'une annonce est irréversible. Toutes les données, visites virtuelles et images seront perdues.</p>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>Supprimer définitivement</button>
          </div>

        </form>
      </div>
    </div>
  );
}
