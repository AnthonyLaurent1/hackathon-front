import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import siteService from '../services/siteService';
import LoadingSpinner from '../components/LoadingSpinner';

const HistoryPage = () => {
  const [sites, setSites] = useState([]);
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    siteService.getAllSites().then((data) => {
      setSites(data);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || 'Erreur récupération historique');
      setLoading(false);
    });
  }, []);

  const timeline = useMemo(() => {
    const points = {};
    sites.forEach((site) => {
      (site.history || []).forEach((h) => {
        const date = new Date(h.date);
        if (date < new Date(fromDate) || date > new Date(toDate)) return;
        const key = date.toISOString().slice(0, 10);
        points[key] = (points[key] || 0) + h.totalCO2;
      });
    });
    return Object.entries(points).map(([date, totalCO2]) => ({ date, totalCO2: Number(totalCO2.toFixed(2)) })).sort((a,b)=>a.date.localeCompare(b.date));
  }, [sites, fromDate, toDate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="page history-page">
      <h2>Historique des émissions</h2>

      <div className="toolbar">
        <label>
          Du
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          Au
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
      </div>

      <section className="chart-card">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="totalCO2" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Données brutes</h3>
        <table className="data-table small">
          <thead><tr><th>Date</th><th>CO₂ total</th></tr></thead>
          <tbody>
            {timeline.map((row) => (
              <tr key={row.date}><td>{row.date}</td><td>{row.totalCO2}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default HistoryPage;
