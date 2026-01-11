import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StoryboardWorkspace from './pages/StoryboardWorkspace';
import KeyVault from './pages/KeyVault';
import SystemPrompts from './pages/SystemPrompts';
import AuthGuard from './components/AuthGuard';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <Layout>{children}</Layout>
  </AuthGuard>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        <Route path="/project/:id" element={
            <ProtectedRoute><StoryboardWorkspace /></ProtectedRoute>
        } />
        
        <Route path="/keys" element={
            <ProtectedRoute><KeyVault /></ProtectedRoute>
        } />
        
        <Route path="/prompts" element={
            <ProtectedRoute><SystemPrompts /></ProtectedRoute>
        } />
        
        {/* Redirects */}
        <Route path="/settings" element={<Navigate to="/prompts" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
