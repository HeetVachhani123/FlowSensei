// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

type Mode = 'signin' | 'signup' | 'forgot';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('signin');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();

  // Get the intended destination after login
  const from = (location.state as { from: string })?.from || '/dashboard';

  // Automatically redirect if the user is already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        // Send reset email via Supabase Auth
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetError) throw resetError;
        setSuccessMsg('Password reset link sent! Check your inbox.');
      } else if (mode === 'signup') {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;
        if (!user) {
          setSuccessMsg('Account created! Check your email to confirm, then sign in.');
          setMode('signin');
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        // useEffect will redirect once user updates
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('failed to fetch')) {
        setError('Unable to reach Supabase backend. Your database project may be paused due to inactivity in the Supabase Dashboard (https://supabase.com/dashboard).');
      } else {
        setError(message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  const titles: Record<Mode, string> = {
    signin: 'Log in to FlowSensei',
    signup: 'Create an account',
    forgot: 'Reset your password',
  };
  const subtitles: Record<Mode, string> = {
    signin: 'Enter your email below to log into your account',
    signup: 'Enter your details below to create your account',
    forgot: 'Enter your email and we\'ll send a reset link',
  };
  const ctaLabels: Record<Mode, string> = {
    signin: 'Sign in',
    signup: 'Sign up',
    forgot: 'Send reset link',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0c0c0d] pt-16">
      <div className="bg-white dark:bg-[#121214] p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xl">
            F
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center text-zinc-900 dark:text-zinc-100 tracking-tight">
          {titles[mode]}
        </h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
          {subtitles[mode]}
        </p>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Success banner */}
        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
              placeholder="m@example.com"
            />
          </div>

          {/* Password — hidden on forgot mode */}
          {mode !== 'forgot' && (
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-1.5" htmlFor="password">
                Password
              </label>
              {/* Password visibility toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Forgot password link */}
          {mode === 'signin' && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            id="login-submit-btn"
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 transition-all shadow-sm hover:shadow-indigo-500/25 hover:shadow-md mt-2"
          >
            {isLoading ? 'Please wait...' : ctaLabels[mode]}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="mt-6 text-center space-y-2">
          {mode !== 'signin' && (
            <button
              onClick={() => switchMode('signin')}
              className="block w-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm transition-colors"
            >
              Back to sign in
            </button>
          )}
          {mode === 'signin' && (
            <button
              onClick={() => switchMode('signup')}
              className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm transition-colors"
            >
              Don&apos;t have an account? Sign up
            </button>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};