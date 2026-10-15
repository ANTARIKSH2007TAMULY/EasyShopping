import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import { LogoIcon, EyeIcon, EyeOffIcon, Spinner } from '../components/icons';

const getRegisterErrorMessage = (err, fallback = 'Registration failed. Please try again.') => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;

  if (err?.code === 'ERR_NETWORK') {
    return 'Unable to reach the ShopKart server. Please try again in a moment.';
  }

  if (status === 400) {
    return message || 'Please fill in all required fields properly.';
  }

  if (status === 409) {
    return message || 'An account with this email already exists.';
  }

  return message || fallback;
};

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) setError(null);
    if (success) setSuccess('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, phone } = formData;

    if (!fullName.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setError('Please fill in all fields');
      setSuccess('');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setSuccess('');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      await api.post('/customers/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      console.error('Registration request failed', {
        status: err?.response?.status,
        message: err?.response?.data?.message,
      });
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Link to="/" className="auth-brand" aria-label="ShopKart Homepage">
          <LogoIcon size={30} />
          <span>ShopKart</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="auth-card auth-card--register">
        <div className="auth-header">
          <span className="brand-mark">Create Account</span>
          <h1>Join ShopKart</h1>
          <p>Sign up to curate your wishlist, save orders, and shop faster.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field-group">
            <label htmlFor="register-fullName">Full Name</label>
            <input
              id="register-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Aarav Sharma"
              required
              autoComplete="name"
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Password</label>
            <div className="input-with-action">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                autoComplete="new-password"
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

          <div className="field-group">
            <label htmlFor="register-phone">Phone Number</label>
            <input
              id="register-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              required
              autoComplete="tel"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message" role="status">
              <span>{success}</span>
            </div>
          )}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={18} />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="switch-link">
          Already have an account? <Link to="/login">Sign In Here</Link>
        </p>
      </main>
    </div>
  );
}

export default Register;
