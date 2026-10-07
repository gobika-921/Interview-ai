import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import AptitudeRound from './pages/interviews/AptitudeRound';
import CodingRound from './pages/interviews/CodingRound';
import HRRound from './pages/interviews/HRRound';
import TechnicalRound from './pages/interviews/TechnicalRound';
import CompanySpecific from './pages/interviews/CompanySpecific';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import CompanyList from './pages/CompanyList';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';

function PrivateRoute({ children, requireProfile = true }: { children: React.ReactNode; requireProfile?: boolean }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/auth" replace />;
  
  if (requireProfile && !userProfile) return <Navigate to="/profile-setup" replace />;

  return <>{children}</>;
}

function PublicAuthRoute() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={userProfile ? "/dashboard" : "/profile-setup"} replace />;
  }

  return <AuthPage />;
}

function RootRoute() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={userProfile ? "/dashboard" : "/profile-setup"} replace />;
  }

  return <LandingPage />;
}

function AppContent() {
  const { currentUser, userProfile } = useAuth();
  const showSidebar = !!(currentUser && userProfile);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col lg:flex-row">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        {!showSidebar && <Navbar />}
        <main className={`flex-1 ${showSidebar ? 'md:p-10 p-4 max-w-7xl mx-auto w-full' : ''}`}>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/auth" element={<PublicAuthRoute />} />
            <Route path="/profile-setup" element={
              <PrivateRoute requireProfile={false}>
                <ProfileSetup />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/mock/aptitude" element={
              <PrivateRoute>
                <AptitudeRound />
              </PrivateRoute>
            } />
            <Route path="/mock/coding" element={
              <PrivateRoute>
                <CodingRound />
              </PrivateRoute>
            } />
            <Route path="/mock/hr" element={
              <PrivateRoute>
                <HRRound />
              </PrivateRoute>
            } />
            <Route path="/mock/technical" element={
              <PrivateRoute>
                <TechnicalRound />
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            } />
            <Route path="/feedback" element={
              <PrivateRoute>
                <FeedbackPage />
              </PrivateRoute>
            } />
            <Route path="/feedback/:interviewId" element={
              <PrivateRoute>
                <FeedbackPage />
              </PrivateRoute>
            } />
            <Route path="/company-list" element={
              <PrivateRoute>
                <CompanyList />
              </PrivateRoute>
            } />
            <Route path="/resume-analyzer" element={
              <PrivateRoute>
                <ResumeAnalyzer />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/company/:companyId" element={
              <PrivateRoute>
                <CompanySpecific />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
