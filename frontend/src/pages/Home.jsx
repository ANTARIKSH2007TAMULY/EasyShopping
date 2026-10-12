import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api, { getProducts } from '../services/api';

function Home() {
  const [customer, setCustomer] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get('/customers/me');
        setCustomer(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }

        setError('Unable to load your profile. Please try again later.');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setFeaturedProducts((response.data.products || []).slice(0, 4));
      } catch (err) {
        setFeaturedProducts([]);
      }
    };

    fetchCustomer();
    fetchProducts();
  }, [navigate]);

  if (!customer && !error) {
    return (
      <div className="home-shell">
        <Navbar />
        <main className="page-loading-wrap">
          <div className="loading-state">Loading customer information...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-shell">
      <Navbar />
      <main className="home-page">
        {error ? (
          <div className="home-content-card">
            <p className="error-message">{error}</p>
          </div>
        ) : (
          <div className="home-dashboard">
            <section className="hero-panel">
              <div className="hero-copy">
                <p className="eyebrow">Welcome back</p>
                <h1>Welcome, {customer.fullName}</h1>
                <p className="hero-subtitle">
                  Discover premium products, save your favourites, and keep your cart ready for your next great purchase.
                </p>
                <div className="hero-actions">
                  <Link to="/products" className="primary-button inline-button">Browse Products</Link>
                  <Link to="/wishlist" className="secondary-button inline-button">View Wishlist</Link>
                </div>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <span className="stat-label">Profile</span>
                  <strong>Active</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Wishlist</span>
                  <strong>Curated</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Cart</span>
                  <strong>Ready</strong>
                </div>
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-header">
                <div className="profile-badge">{customer.fullName.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="eyebrow eyebrow-small">Your account</p>
                  <h2>{customer.fullName}</h2>
                </div>
              </div>

              <div className="info-list">
                <div className="info-row">
                  <span>Full name</span>
                  <strong>{customer.fullName}</strong>
                </div>

                <div className="info-row">
                  <span>Email address</span>
                  <strong>{customer.email}</strong>
                </div>

                <div className="info-row">
                  <span>Phone number</span>
                  <strong>{customer.phone}</strong>
                </div>
              </div>
            </section>

            <section className="home-products-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow eyebrow-small">Discover</p>
                  <h2>Popular picks</h2>
                </div>
                <Link to="/products" className="text-link">View all</Link>
              </div>

              <div className="home-products-grid">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)
                ) : (
                  <div className="home-empty-state">No products available right now.</div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
