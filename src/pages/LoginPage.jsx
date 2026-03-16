import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@carbon');
  const [password, setPassword] = useState('hackathon');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>CarbonHack</h1>
            <p>Calcul d'empreinte carbone - Hackathon 2026</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="demo@carbon"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            {error && <div className="alert-error">{error}</div>}
          </form>

          <div className="login-hint">
            <p><strong>Démo :</strong> demo@carbon / hackathon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
