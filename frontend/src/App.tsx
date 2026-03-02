import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api, { setAuthToken } from './api/api';
import { useAuth } from './context/auth.context';
import DashboardPage from './pages/DashboardPage';
import OrganizationPage from './pages/OrganizationPage';
import OrganizationsListPage from './pages/OrganizationsListPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectPage from './pages/ProjectPage';
import ProjectHome from './pages/ProjectHome';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardLayout from './layouts/DashboardLayout';
import EventsListPage from './pages/EventsListPage';
import EventManagePage from './pages/EventManagePage';

const App = () => {
  const { authenticated, loading, token } = useAuth();
  const [status, setStatus] = useState<string>('Idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const testConnection = async () => {
    setStatus('Testing...');
    setError(null);
    try {
      const response = await api.get('/api/status');
      setStatus(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setStatus('Failed');
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl animate-pulse shadow-lg shadow-primary/20">
            OS
          </div>
          <div className="absolute -inset-2 rounded-2xl border-2 border-primary/20 animate-ping opacity-20"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Initializing Command Center</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Verifying Identity...</p>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected App Routes */}
        {authenticated ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/organizations" element={<OrganizationsListPage />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:eventId/manage" element={<EventManagePage />} />
            <Route path="/organizations/:orgId" element={<OrganizationPage />} />
            <Route path="/p/:projectSlug" element={<ProjectHome />} />
            <Route path="/projects/:projectId/manage" element={<ProjectPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/404" replace />} />
        )}

        {/* Catch-all 404 Route */}
        <Route path="/404" element={<NotFoundPage />} />
      </Routes>

      {/* Global Connection Test (Helper) */}
      <div style={{ padding: '20px' }}>
        <hr style={{ marginTop: '50px' }} />
        <details>
          <summary>System Status & Debug Tools</summary>
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', fontSize: '0.9em' }}>
            <button onClick={testConnection}>Test Backend Connection</button>
            <pre style={{ marginTop: '10px', background: '#f8f8f8', padding: '5px' }}>
              Response: {status}
            </pre>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          </div>
        </details>
      </div>
    </BrowserRouter>
  );
}

export default App;