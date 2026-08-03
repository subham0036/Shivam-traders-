import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import '../components/common/LoginPromptModal.css';

const LoginPromptContext = createContext(null);

const SKIP_PATH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/admin', '/staff'];

const REASON_COPY = {
  welcome: {
    title: 'Welcome to Shivam Traders',
    body: 'Login to track orders, save your wishlist, and checkout faster.',
  },
  checkout: {
    title: 'Login before checkout?',
    body: 'Sign in for faster checkout and order tracking. You can still continue as a guest if you prefer.',
  },
  buy: {
    title: 'Login to continue',
    body: 'Create an account or sign in before placing your order. Guest checkout is also available.',
  },
};

export const LoginPromptProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [modal, setModal] = useState({ open: false, reason: 'welcome', onContinue: null });

  const closePrompt = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }));
  }, []);

  const promptLogin = useCallback(({ reason = 'welcome', onContinue = null } = {}) => {
    if (user) {
      onContinue?.();
      return;
    }
    setModal({ open: true, reason, onContinue });
  }, [user]);

  const handleContinueAsGuest = () => {
    const continueFn = modal.onContinue;
    closePrompt();
    continueFn?.();
  };

  const handleLogin = () => {
    closePrompt();
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
    closePrompt();
    navigate('/register', { state: { from: location.pathname } });
  };

  useEffect(() => {
    if (loading || user) return;
    if (sessionStorage.getItem('st_login_prompt_timer_shown')) return;
    if (SKIP_PATH_PREFIXES.some((p) => location.pathname.startsWith(p))) return;

    const timer = window.setTimeout(() => {
      if (sessionStorage.getItem('st_login_prompt_timer_shown')) return;
      sessionStorage.setItem('st_login_prompt_timer_shown', '1');
      setModal({ open: true, reason: 'welcome', onContinue: null });
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [user, loading, location.pathname]);

  const copy = REASON_COPY[modal.reason] || REASON_COPY.welcome;

  return (
    <LoginPromptContext.Provider value={{ promptLogin }}>
      {children}
      {modal.open && (
        <div className="login-prompt-backdrop" role="presentation" onClick={closePrompt}>
          <div
            className="login-prompt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-prompt-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="login-prompt-close" onClick={closePrompt} aria-label="Close">
              <FiX />
            </button>
            <span className="login-prompt-om" aria-hidden="true">🕉</span>
            <h2 id="login-prompt-title">{copy.title}</h2>
            <p>{copy.body}</p>
            <div className="login-prompt-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={handleLogin}>
                Customer Login
              </button>
              <button type="button" className="btn btn-outline btn-lg" onClick={handleRegister}>
                Register
              </button>
              {modal.onContinue ? (
                <button type="button" className="btn btn-gold btn-lg" onClick={handleContinueAsGuest}>
                  Continue as Guest
                </button>
              ) : (
                <button type="button" className="login-prompt-dismiss" onClick={closePrompt}>
                  Maybe later
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
};

export const useLoginPrompt = () => {
  const ctx = useContext(LoginPromptContext);
  if (!ctx) throw new Error('useLoginPrompt must be used within LoginPromptProvider');
  return ctx;
};
