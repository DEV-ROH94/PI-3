import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Prontuarios from './views/Prontuarios';
import Assistidos from './views/Assistidos';
import Relatorios from './views/Relatorios';
import Configuracoes from './views/Configuracoes';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

import SignUp from './views/SignUp';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <SignUp />} />
        
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/prontuarios" element={session ? <Prontuarios /> : <Navigate to="/login" />} />
        <Route path="/dashboard/assistidos" element={session ? <Assistidos /> : <Navigate to="/login" />} />
        <Route path="/dashboard/relatorios" element={session ? <Relatorios /> : <Navigate to="/login" />} />
        <Route path="/dashboard/config" element={session ? <Configuracoes /> : <Navigate to="/login" />} />
        <Route path="/dashboard/*" element={<Navigate to="/dashboard" />} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
