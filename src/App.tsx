import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "./store/auth";
import { supabase } from "./lib/supabase";
import { Header } from "./components/Header";
import { LoginPage } from "./screens/LoginPage";
import { SignupPage } from "./screens/SignupPage";
import { PersonaSelection } from "./screens/PersonaSelection";
import { Toaster } from "./components/Toaster";

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
        {/* Logo - Bottom Right on all pages */}
        <div className="fixed bottom-4 right-4 z-50">
          <img
            src="/images/black_circle_360x360.png"
            alt="Bolt Logo"
            className="w-12 h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
          />
        </div>

        <Routes>
          {/* Public routes - redirect to personas if authenticated */}
          <Route path="/login" element={
            user ? <Navigate to="/personas" replace /> : <LoginPage />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/personas" replace /> : <SignupPage />
          } />
          
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
          
          {/* Default redirect based on auth status */}
          <Route path="/" element={
            user ? <Navigate to="/personas" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster />
      </main>
    </Router>
  );
}

export default App;