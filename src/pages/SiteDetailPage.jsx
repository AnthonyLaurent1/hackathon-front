import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import siteService from '../services/siteService';
import LoadingSpinner from '../components/LoadingSpinner';

const SiteDetailPage = () => {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    siteService.getSiteById(id).then((data) => {
      if (!data) {
        setError('Site introuvable');
        setLoading(false);
        return;
      }
      setSite(data);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || 'Erreur chargement');
      setLoading(false);
    });
  }, [id]);

  const pieData = useMemo(() => {
    if (!site) return [];
    return [
      { name: 'Construction', value: site.constructionCO2 },
      { name: 'Exploitation', value: site.exploitationCO2 },
    ];
  }, [site]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="page site-detail-page">
      <div className="page-header">
        <h2>Détail : {site.name}</h2>
        <div>
          <button className="btn" onClick={() => navigate(`/sites/${id}/edit`)}>Éditer</button>
          <button className="btn-secondary" onClick={() => navigate('/sites')}>Retour</button>
        </div>
      </div>

      <div className="kpis-grid">
        <article className="kpi-card"><p>CO₂ total</p><h3>{site.totalCO2}</h3></article>
        <article className="kpi-card"><p>CO₂/m²</p><h3>{site.co2PerM2}</h3></article>
        <article className="kpi-card"><p>CO₂/employé</p><h3>{site.co2PerEmployee}</h3></article>
        <article className="kpi-card"><p>Surface</p><h3>{site.surface} m²</h3></article>
      </div>

      <div className="charts-row">
        <section className="chart-card">
          <h3>Répartition émissions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry, i) => <Cell key={entry.name} fill={i === 0 ? '#6b5b95' : '#feb236'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-card">
          <h3>Historique des calculs</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(site.history || []).slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
              <Bar dataKey="totalCO2" fill="#d64161" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="card">
        <h3>Liste des matériaux</h3>
        <table className="data-table small">
          <thead><tr><th>Matériel</th><th>Quantité</th><th>tCO₂e/u</th></tr></thead>
          <tbody>
            {Object.entries(site.materials).map(([key, mat]) => (
              <tr key={key}><td>{mat.label}</td><td>{mat.quantity}</td><td>{mat.co2e}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SiteDetailPage;
