import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import siteService from '../services/siteService';
import LoadingSpinner from '../components/LoadingSpinner';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ComparePage = () => {
  const [sites, setSites] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = useQuery();

  const selectedFromUrl = query.getAll('selected');

  useEffect(() => {
    siteService.getAllSites().then((data) => {
      setSites(data);
      if (selectedFromUrl.length) {
        const picked = data.filter((s) => selectedFromUrl.includes(s.id)).map((s) => s.id);
        setSelected(picked);
      }
      setLoading(false);
    }).catch((err) => {
      setError(err.message || 'Erreur chargement');
      setLoading(false);
    });
  }, []);

  const pickedSites = useMemo(() => sites.filter((s) => selected.includes(s.id)), [sites, selected]);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="page compare-page">
      <h2>Comparaison de sites</h2>

      <div className="card">
        <p>Sélectionnez 2 à 5 sites pour comparer.</p>
        <div className="checkbox-grid">
          {sites.map((site) => (
            <label key={site.id} className="checkbox-row">
              <input type="checkbox" checked={selected.includes(site.id)} onChange={() => toggle(site.id)} />
              {site.name} ({site.location})
            </label>
          ))}
        </div>
      </div>

      {pickedSites.length < 2 ? (
        <div className="alert-warning">Sélectionnez au moins 2 sites pour voir la comparaison.</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table small">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>CO₂ total</th>
                  <th>CO₂/m²</th>
                  <th>CO₂/employé</th>
                </tr>
              </thead>
              <tbody>
                {pickedSites.map((site) => (
                  <tr key={site.id}>
                    <td>{site.name}</td>
                    <td>{site.totalCO2}</td>
                    <td>{site.co2PerM2}</td>
                    <td>{site.co2PerEmployee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="charts-row">
            <section className="chart-card">
              <h3>CO₂ total par site</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={pickedSites}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCO2" fill="#6b5b95" name="Total" />
                  <Bar dataKey="constructionCO2" fill="#feb236" name="Construction" />
                  <Bar dataKey="exploitationCO2" fill="#d64161" name="Exploitation" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;
