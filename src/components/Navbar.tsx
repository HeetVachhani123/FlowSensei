import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDemoEmail = user?.email?.toLowerCase().includes('test1234') || user?.email?.toLowerCase().includes('demo');
  const displayEmail = isDemoEmail ? 'demo@flowsensei.dev' : user?.email;
  const displayName = isDemoEmail ? 'Demo Engineer' : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0c0c0d]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[52px]">
          <div className="flex-shrink-0 flex items-center gap-2.5 cursor-pointer" onClick={() => navigate(user ? '/dashboard' : '/', { replace: true })}>
            <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm">
              F
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              FlowSensei
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user && (
              <button
                onClick={() => navigate(isHomePage ? '/dashboard' : '/')}
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors hidden sm:block"
              >
                {isHomePage ? 'Dashboard' : 'Home'}
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-500 dark:text-zinc-400"
              aria-label="Toggle Theme"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {theme === 'dark' ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                )}
              </svg>
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold ring-2 ring-transparent hover:ring-indigo-500/30 transition-all focus:outline-none"
                  aria-label="User Menu"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  {userInitial}
                </button>

                {isDropdownOpen && (
                  <div 
                    role="menu"
                    aria-label="User actions"
                    className="absolute right-0 mt-2 w-56 py-1 bg-white dark:bg-[#18181b] rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 origin-top-right animate-modal-pop z-50"
                  >
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm text-zinc-900 dark:text-zinc-100 font-bold truncate">{displayName}</p>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-bold">
                          OWNER
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate" title={displayEmail}>{displayEmail}</p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => { setIsDropdownOpen(false); navigate('/'); }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      Home page
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => { setIsDropdownOpen(false); navigate('/dashboard'); }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      Dashboard
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => { setIsDropdownOpen(false); signOut(); navigate('/login'); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800/50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-indigo-500/20"
                >
                  Get started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};