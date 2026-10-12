import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setSuccess('');
  }, []);

  const handleChange = (e) => {
    setError(null);
    setSuccess('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      setError('Password must be at least 6 characters');
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

      setSuccess('Registration successful');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <div className="auth-brand">ShopKart</div>
        <ThemeToggle />
      </div>

      <div className="auth-card auth-card--register">
        <div className="auth-header">
          <span className="brand-mark">Create account</span>
          <h1>Join ShopKart</h1>
          <p>Sign up to discover great deals, save favorites and shop faster.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="register-fullName">Full Name</label>
            <input
              id="register-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-phone">Phone Number</label>
            <input
              id="register-phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Loading...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
