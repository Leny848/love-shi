import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicProposalPage } from './pages/PublicProposalPage';
import { InteractiveBackground } from './components/InteractiveBackground';
import { SoundToggle } from './components/SoundToggle';

function MainRouter() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blush-gradient flex items-center justify-center text-slate-500 font-serif text-lg">
        Loading DateSite... 🌸
      </div>
    );
  }

  // Check if viewing public proposal route e.g. /p/kyle-asks-maya
  if (currentPath.startsWith('/p/')) {
    const slug = currentPath.replace(/^\/p\//, '').split('/')[0].split('?')[0].trim().toLowerCase();
    if (slug) {
      return <PublicProposalPage slug={slug} />;
    }
  }

  // Dashboard / Auth routes
  if (user) {
    return <DashboardPage />;
  }

  return (
    <div className="min-h-screen bg-blush-gradient flex flex-col justify-between items-center py-8 px-4 relative overflow-hidden">
      <SoundToggle />
      <InteractiveBackground />
      <div className="w-full max-w-md my-auto">
        <AuthPage onLoginSuccess={() => setCurrentPath('/dashboard')} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
