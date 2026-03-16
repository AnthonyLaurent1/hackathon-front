import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import siteService from '../services/siteService';
import LoadingSpinner from '../components/LoadingSpinner';

const SitesPage = () => {
  const [sites, setSites] = useState([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('totalCO2');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = () => {
    setLoading(true);
    siteService.getAllSites().then((data) => {
      setSites(data);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || 'Erreur chargement sites');
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const under = query.trim().toLowerCase();
    const copy = sites.filter((site) => site.name.toLowerCase().includes(under) || site.location.toLowerCase().includes(under));
    return copy.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [sites, query, sortBy]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="page sites-page">
      <div className="page-header">
        <h2>Liste des sites</h2>
        <Link className="btn" to="/sites/new">+ Créer un site</Link>
      </div>

      <div className="toolbar">
        <input placeholder="Rechercher par nom ou localisation" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label>
          Trier par
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="totalCO2">CO₂ total</option>
            <option value="co2PerM2">CO₂/m²</option>
            <option value="co2PerEmployee">CO₂/employé</option>
            <option value="surface">Surface</option>
          </select>
        </label>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Localisation</th>
            <th>Surface</th>
            <th>CO₂ total (t)</th>
            <th>CO₂ / m²</th>
            <th>CO₂ / employé</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((site) => (
            <tr key={site.id}>
              <td>{site.name}</td>
              <td>{site.location}</td>
              <td>{site.surface}</td>
              <td>{site.totalCO2}</td>
              <td>{site.co2PerM2}</td>
              <td>{site.co2PerEmployee}</td>
              <td>
                <Link className="link-btn" to={`/sites/${site.id}`}>Voir</Link>
                <Link className="link-btn" to={`/sites/${site.id}/edit`}>Éditer</Link>
                <Link className="link-btn" to={`/compare?selected=${site.id}`}>Comparer</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SitesPage;
