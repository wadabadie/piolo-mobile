import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PropertySearch() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const searchProperties = async () => {
    try {
      const response = await axios.get('/api/properties/', { params: filters });
      setProperties(response.data.results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    }
  };

  useEffect(() => {
    searchProperties();
  }, []);

  return (
    <div className="property-search">
      <div className="filters">
        <select onChange={(e) => setFilters({...filters, type: e.target.value})}>
          <option value="">Tous les types</option>
          <option value="apartment">Appartement</option>
          <option value="villa">Villa</option>
        </select>
        {/* Autres filtres... */}
        <button onClick={searchProperties} className="btn-gold">
          Rechercher
        </button>
      </div>
      
      <div className="results-grid">
        {properties.map(property => (
          <div key={property.id} className="property-card">
            <img src={property.image} alt={property.title} />
            <h3>{property.title}</h3>
            <p className="price">{property.price.toLocaleString()} FCFA</p>
            <p className="location">{property.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}