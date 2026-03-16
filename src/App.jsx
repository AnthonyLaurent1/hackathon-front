import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SitesPage from './pages/SitesPage';
import SiteFormPage from './pages/SiteFormPage';
import SiteDetailPage from './pages/SiteDetailPage';
import ComparePage from './pages/ComparePage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sites" element={<SitesPage />} />
            <Route path="sites/new" element={<SiteFormPage />} />
            <Route path="sites/:id/edit" element={<SiteFormPage />} />
            <Route path="sites/:id" element={<SiteDetailPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
