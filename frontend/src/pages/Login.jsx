import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import { LogoIcon, EyeIcon, EyeOffIcon, Spinner } from '../components/icons';

const getLoginErrorMessage = (err, fallback = 'Invalid Credentials') => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;

  if (err?.code === 'ERR_NETWORK') {
    return 'Unable to reach the EasyShopping server. Please try again in a moment.';
  }

  if (status === 400) {
    return message || 'Please enter your email and password.';
  }

  if (status === 401) {
    return message || 'Invalid email or password.';
  }

  return message || fallback;
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/customers/login', {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      navigate('/home');
    } catch (err) {
      console.error('Login request failed', {
        status: err?.response?.status,
        message: err?.response?.data?.message,
      });
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Link to="/" className="auth-brand" aria-label="EasyShopping Homepage">
          <LogoIcon size={30} />
          <span>EasyShopping</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="auth-card auth-card--login">
        <div className="auth-header">
          <span className="brand-mark">Welcome Back</span>
          <h1>Sign In to EasyShopping</h1>
          <p>Access your saved wishlist, active cart, and order history.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-action">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="field-toggle-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={18} />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="switch-link">
          Don&apos;t have an account? <Link to="/register">Create Free Account</Link>
        </p>
      </main>
    </div>
  );
}

export default Login;
