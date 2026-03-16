import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import siteService from '../services/siteService';
import LoadingSpinner from '../components/LoadingSpinner';

const defaultMaterial = { label: '', quantity: 0, co2e: 0.0 };

const SiteFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [site, setSite] = useState({
    name: '',
    location: '',
    surface: 0,
    employees: 0,
    energyConsumption: 0,
    materials: { beton: { ...defaultMaterial, label: 'Béton' }, acier: { ...defaultMaterial, label: 'Acier' }, bois: { ...defaultMaterial, label: 'Bois' } },
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    siteService.getSiteById(id).then((data) => {
      if (!data) {
        setError('Site introuvable');
        setLoading(false);
      } else {
        setSite(data);
        setLoading(false);
      }
    }).catch((err) => {
      setError(err.message || 'Erreur récupération site');
      setLoading(false);
    });
  }, [id, isEdit]);

  const setField = (field, value) => setSite((prev) => ({ ...prev, [field]: value }));

  const setMaterialField = (key, field, value) => {
    setSite((prev) => ({
      ...prev,
      materials: {
        ...prev.materials,
        [key]: {
          ...prev.materials[key],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        await siteService.updateSite(id, site);
      } else {
        await siteService.createSite(site);
      }
      navigate('/sites');
    } catch (err) {
      setError(err.message || 'Erreur sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page site-form-page">
      <h2>{isEdit ? 'Modifier un site' : 'Créer un nouveau site'}</h2>

      {error && <div className="alert-error">{error}</div>}

      <div className="form-info">
        <span>Complétez les informations de votre site pour calculer son empreinte carbone.</span>
      </div>

      <form className="form-grid form-container" onSubmit={handleSubmit}>
        {/* Informations générales */}
        <div className="form-section" style={{ '--delay': '0.1s' }}>
          <div className="form-section-header">
            <h3 className="form-section-title">Informations générales</h3>
          </div>
          
          <div className="form-row full">
            <div className="form-group">
              <label>Nom du site</label>
              <input 
                required 
                value={site.name} 
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ex: Usine de production, Bureau Paris, Warehouse Nord"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Localisation</label>
              <input 
                required 
                value={site.location} 
                onChange={(e) => setField('location', e.target.value)}
                placeholder="Ex: Lyon, Île-de-France, Toulouse"
              />
            </div>
          </div>
        </div>

        <div className="form-section" style={{ '--delay': '0.15s' }}>
          <div className="form-section-header">
            <h3 className="form-section-title">Données structurelles</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Surface (m²)</label>
              <input 
                type="number" 
                min="0" 
                step="1"
                value={site.surface} 
                onChange={(e) => setField('surface', Number(e.target.value))} 
                required 
                placeholder="0"
              />
              <span className="help-text">ex: 2500</span>
            </div>

            <div className="form-group">
              <label>Nombre d'employés</label>
              <input 
                type="number" 
                min="0" 
                step="1"
                value={site.employees} 
                onChange={(e) => setField('employees', Number(e.target.value))} 
                required 
                placeholder="0"
              />
              <span className="help-text">ex: 150</span>
            </div>
          </div>
        </div>

        <div className="form-section" style={{ '--delay': '0.2s' }}>
          <div className="form-section-header">
            <h3 className="form-section-title">Consommation énergétique</h3>
          </div>
          
          <div className="form-row full">
            <div className="form-group">
              <label>Consommation annuelle (kWh)</label>
              <input 
                type="number" 
                min="0" 
                step="100"
                value={site.energyConsumption} 
                onChange={(e) => setField('energyConsumption', Number(e.target.value))} 
                required 
                placeholder="0"
              />
              <span className="help-text info">ex: 450000 kWh/an</span>
            </div>
          </div>
        </div>

        <div className="form-section" style={{ '--delay': '0.25s' }}>
          <div className="form-section-header">
            <h3 className="form-section-title">Matériaux utilisés</h3>
          </div>
          
          <div className="materials-grid">
            {Object.entries(site.materials).map(([key, material], idx) => (
              <div className="material-item" key={key} style={{ '--delay': `${0.3 + idx * 0.05}s` }}>
                <div className="material-label">{material.label}</div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Quantité</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    value={material.quantity} 
                    onChange={(e) => setMaterialField(key, 'quantity', Number(e.target.value))} 
                    placeholder="0" 
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>tCO₂e/u</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={material.co2e} 
                    onChange={(e) => setMaterialField(key, 'co2e', Number(e.target.value))} 
                    placeholder="0" 
                  />
                </div>
              </div>
            ))}
          </div>
          <span className="help-text" style={{ marginTop: '12px', display: 'block' }}>
            Estimez les quantités et coefficients d'émission de chaque matériau
          </span>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Calcul en cours...' : 'Calculer & Sauvegarder'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/sites')} disabled={submitting}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteFormPage;
