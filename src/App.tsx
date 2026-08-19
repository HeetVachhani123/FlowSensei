import { BrowserRouter as Router, Route, Routes, useLocation, Link } from 'react-router-dom';
import {  AuthProvider  } from './components/providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { Navbar } from './components/Navbar';
import {  ToastProvider  } from './components/providers/ToastProvider';
import {  ThemeProvider  } from './components/providers/ThemeProvider';

// M16: Wrapper so Navbar can use useLocation (must be inside <Router>)
const AppShell = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <ThemeProvider>
      <AuthProvider>
        {!hideNavbar && <Navbar />}
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/board/:id" element={<ProtectedRoute><Board /></ProtectedRoute>} />
            {/* P9: 404 catch-all */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0c0c0d] pt-16">
                <div className="text-center animate-fade-in-up">
                  <p className="text-8xl font-black text-zinc-200 dark:text-zinc-800 mb-4">404</p>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Page not found</h1>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">This page doesn&apos;t exist or you don&apos;t have access to it.</p>
                  <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Back to Home
                  </Link>
                </div>
              </div>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <Router>
    <AppShell />
  </Router>
);

export default App;