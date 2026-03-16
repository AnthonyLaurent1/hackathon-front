import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="page notfound-page">
    <h2>404 - Page non trouvée</h2>
    <p>Cette route n'existe pas.</p>
    <Link className="btn" to="/dashboard">Retour au dashboard</Link>
  </div>
);

export default NotFoundPage;
