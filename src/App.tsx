import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "./store/auth";
import { supabase } from "./lib/supabase";
import { Header } from "./components/Header";
import { LoginPage } from "./screens/LoginPage";
import { SignupPage } from "./screens/SignupPage";
import { PersonaSelection } from "./screens/PersonaSelection";
import { Toaster } from "react-hot-toast";

function App() {
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
          created_at: session.user.created_at,
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
          created_at: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <main className="flex h-svh flex-col items-center justify-between gap-3 sm:gap-4 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes with header */}
          <Route path="/personas" element={
            user ? (
              <>
                <Header />
                <PersonaSelection />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Default redirect */}
          <Route path="/" element={
            user ? <Navigate to="/personas" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #f3e8ff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            success: {
              style: {
                border: '1px solid #10b981',
              },
            },
            error: {
              style: {
                border: '1px solid #ef4444',
              },
            },
          }}
        />
      </main>
    </Router>
  );
}

export default App;