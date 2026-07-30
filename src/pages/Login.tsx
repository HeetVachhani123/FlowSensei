// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
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
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;
        // If email confirmations are disabled, signUp also signs the user in instantly
        // and the useEffect above will redirect them automatically.
        // If they are enabled, they stay here and we show a message:
        if (!user) {
          setError('Please check your email to confirm your account.');
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        // The useEffect will handle the redirect once `user` updates
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0c0c0d] pt-16">
      <div className="bg-white dark:bg-[#121214] p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xl">
            F
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center text-zinc-900 dark:text-zinc-100 tracking-tight">
          {isSignUp ? 'Create an account' : 'Log in to FlowSensei'}
        </h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
          {isSignUp ? 'Enter your details below to create your account' : 'Enter your email below to log into your account'}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
              placeholder="m@example.com"
            />
          </div>

          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 transition-colors mt-2"
          >
            {isLoading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};