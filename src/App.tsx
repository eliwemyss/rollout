import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalStyles } from './components/layout/GlobalStyles';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NewRidePage } from './pages/NewRidePage';
import { RideDetailPage } from './pages/RideDetailPage';
import { EditRidePage } from './pages/EditRidePage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AdminPage } from './pages/AdminPage';
import { NewSeriesPage } from './pages/NewSeriesPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { EditSeriesPage } from './pages/EditSeriesPage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/ride/new"
              element={
                <ProtectedRoute>
                  <NewRidePage />
                </ProtectedRoute>
              }
            />
            <Route path="/ride/:id" element={<RideDetailPage />} />
            <Route
              path="/series/new"
              element={
                <ProtectedRoute>
                  <NewSeriesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/series/:id" element={<SeriesDetailPage />} />
            <Route
              path="/series/:id/edit"
              element={
                <ProtectedRoute>
                  <EditSeriesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ride/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRidePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
