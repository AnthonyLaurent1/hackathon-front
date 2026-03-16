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
      <h2>{isEdit ? 'Modifier un site' : 'Créer un site'}</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Informations générales</legend>
          <label>
            Nom
            <input required value={site.name} onChange={(e) => setField('name', e.target.value)} />
          </label>
          <label>
            Localisation
            <input required value={site.location} onChange={(e) => setField('location', e.target.value)} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Données structurelles</legend>
          <label>
            Surface (m²)
            <input type="number" min="0" value={site.surface} onChange={(e) => setField('surface', Number(e.target.value))} required />
          </label>
          <label>
            Employés
            <input type="number" min="0" value={site.employees} onChange={(e) => setField('employees', Number(e.target.value))} required />
          </label>
        </fieldset>

        <fieldset>
          <legend>Consommation énergétique</legend>
          <label>
            kWh / an
            <input type="number" min="0" value={site.energyConsumption} onChange={(e) => setField('energyConsumption', Number(e.target.value))} required />
          </label>
        </fieldset>

        <fieldset>
          <legend>Matériaux</legend>
          {Object.entries(site.materials).map(([key, material]) => (
            <div className="material-row" key={key}>
              <label>{material.label}</label>
              <input type="number" min="0" step="0.1" value={material.quantity} onChange={(e) => setMaterialField(key, 'quantity', Number(e.target.value))} placeholder="Quantité" />
              <input type="number" min="0" step="0.01" value={material.co2e} onChange={(e) => setMaterialField(key, 'co2e', Number(e.target.value))} placeholder="tCO₂e/u" />
            </div>
          ))}
        </fieldset>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>{submitting ? 'Calcul en cours...' : 'Calculer l’empreinte & Sauvegarder'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/sites')}>Annuler</button>
        </div>

        {error && <div className="alert-error">{error}</div>}
      </form>
    </div>
  );
};

export default SiteFormPage;
