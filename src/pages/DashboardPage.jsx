import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import siteService from '../services/siteService';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#6b5b95', '#feb236', '#d64161', '#ff7b25', '#9dd866'];

const DashboardPage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    siteService.getAllSites().then((data) => {
      if (mounted) {
        setSites(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (mounted) {
        setError(err.message || 'Erreur chargement sites');
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const metrics = useMemo(() => {
    const total = sites.reduce((acc, site) => acc + site.totalCO2, 0);
    const totalSurface = sites.reduce((acc, site) => acc + site.surface, 0);
    const totalEmployees = sites.reduce((acc, site) => acc + site.employees, 0);
    const maxSite = [...sites].sort((a,b) => b.totalCO2 - a.totalCO2)[0] || null;
    return {
      totalCO2: Number(total.toFixed(2)),
      co2PerM2: totalSurface ? Number((total / totalSurface).toFixed(2)) : 0,
      co2PerEmployee: totalEmployees ? Number((total / totalEmployees).toFixed(2)) : 0,
      maxSite,
      numSites: sites.length,
    };
  }, [sites]);

  const historyData = useMemo(() => {
    const years = {};
    sites.forEach((site) => {
      site.history?.forEach((p) => {
        const year = new Date(p.date).getFullYear();
        years[year] = (years[year] || 0) + p.totalCO2;
      });
    });
    return Object.entries(years).map(([year, value]) => ({ year, emissions: Number(value.toFixed(2)) })).sort((a, b) => a.year - b.year);
  }, [sites]);

  const pieData = useMemo(() => {
    const c = sites.reduce((acc, site) => acc + site.constructionCO2, 0);
    const e = sites.reduce((acc, site) => acc + site.exploitationCO2, 0);
    return [
      { name: 'Construction', value: Number(c.toFixed(2)) },
      { name: 'Exploitation', value: Number(e.toFixed(2)) },
    ];
  }, [sites]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="page dashboard-page">
      <h2>Dashboard</h2>
      
      <div className="kpis-grid">
        <article className="kpi-card">
          <p>🌍 CO₂ total</p>
          <h3>{metrics.totalCO2} t</h3>
          <span className="kpi-sub">{metrics.numSites} site(s)</span>
        </article>
        <article className="kpi-card">
          <p>📐 CO₂ / m²</p>
          <h3>{metrics.co2PerM2}</h3>
          <span className="kpi-sub">tonne par m²</span>
        </article>
        <article className="kpi-card">
          <p>👥 CO₂ / employé</p>
          <h3>{metrics.co2PerEmployee}</h3>
          <span className="kpi-sub">tonne par personne</span>
        </article>
        <article className="kpi-card">
          <p>🏭 Site plus émetteur</p>
          <h3>{metrics.maxSite ? metrics.maxSite.name : '—'}</h3>
          <span className="kpi-sub">{metrics.maxSite ? `${metrics.maxSite.totalCO2} t` : 'N/A'}</span>
        </article>
      </div>

      <div className="charts-row">
        <section className="chart-card">
          <h3>Répartition Construction / Exploitation</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={45} label={{ fill: '#1a202c', fontSize: 12 }}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val.toFixed(2)} t`} />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-card">
          <h3>Évolution historique</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f6f89" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2f6f89" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="emissions" stroke="#2f6f89" fillOpacity={1} fill="url(#colorEmissions)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="chart-card">
        <h3>Top sites (émissions totales)</h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={[...sites].sort((a,b) => b.totalCO2-a.totalCO2).slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend />
            <Bar dataKey="totalCO2" fill="#2f6f89" name="CO₂ total (tonne)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default DashboardPage;
