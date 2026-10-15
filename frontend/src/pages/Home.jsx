import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import api, { getProducts } from '../services/api';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  RefreshIcon,
  LockIcon,
  PackageIcon,
  HeartIcon,
  Spinner,
} from '../components/icons';

const categories = [
  { name: 'Electronics', count: 'Tech & Gadgets', link: '/products?category=Electronics' },
  { name: 'Fashion', count: 'Apparel & Wear', link: '/products?category=Fashion' },
  { name: 'Home', count: 'Decor & Living', link: '/products?category=Home' },
  { name: 'Sports', count: 'Fitness & Gear', link: '/products?category=Sports' },
  { name: 'Beauty', count: 'Personal Care', link: '/products?category=Beauty' },
];

function Home() {
  const [customer, setCustomer] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
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
        setError('Unable to load customer profile.');
      }
    };

    const fetchFeatured = async () => {
      try {
        setLoadingProducts(true);
        const response = await getProducts();
        setFeaturedProducts((response.data.products || []).slice(0, 4));
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCustomer();
    fetchFeatured();
  }, [navigate]);

  if (!customer && !error) {
    return (
      <div className="home-shell">
        <Navbar />
        <main className="page-loading-wrap" aria-label="Loading your dashboard">
          <div className="loading-state">Loading customer information...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home-shell">
      <Navbar />

      <main className="home-page">
        {error ? (
          <div className="home-content-card">
            <p className="error-message" role="alert">{error}</p>
          </div>
        ) : (
          <div className="home-dashboard">
            {/* Hero Section */}
            <section className="hero-panel" aria-label="Welcome Banner">
              <div className="hero-copy">
                <span className="eyebrow">Curated E-Commerce</span>
                <h1>Welcome, {customer?.fullName || 'Valued Customer'}</h1>
                <p className="hero-subtitle">
                  Discover authentic lifestyle, electronics, home essentials, and apparel.
                  Fast delivery across India and verified Stripe checkout.
                </p>
                <div className="hero-actions">
                  <Link to="/products" className="primary-button inline-button">
                    <span>Explore Products</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <Link to="/wishlist" className="secondary-button inline-button">
                    <HeartIcon size={16} />
                    <span>View Wishlist</span>
                  </Link>
                </div>
              </div>

              <div className="hero-stats" aria-label="Account Highlights">
                <div className="stat-card">
                  <span className="stat-label">Store Status</span>
                  <strong>Active & Live</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Checkout</span>
                  <strong>Stripe Verified</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Dispatch</span>
                  <strong>Nationwide</strong>
                </div>
              </div>
            </section>

            {/* Value Proposition Strip */}
            <section className="home-perks-strip" aria-label="ShopKart Benefits">
              <div className="home-perk-card">
                <div className="home-perk-icon">
                  <TruckIcon size={20} />
                </div>
                <div>
                  <h4>Express Dispatch</h4>
                  <p>Fast, tracked delivery on orders across India</p>
                </div>
              </div>

              <div className="home-perk-card">
                <div className="home-perk-icon">
                  <ShieldCheckIcon size={20} />
                </div>
                <div>
                  <h4>100% Genuine Items</h4>
                  <p>Certified products directly from trusted makers</p>
                </div>
              </div>

              <div className="home-perk-card">
                <div className="home-perk-icon">
                  <RefreshIcon size={20} />
                </div>
                <div>
                  <h4>7-Day Replacement</h4>
                  <p>Hassle-free support on verified purchases</p>
                </div>
              </div>

              <div className="home-perk-card">
                <div className="home-perk-icon">
                  <LockIcon size={20} />
                </div>
                <div>
                  <h4>Stripe Payments</h4>
                  <p>Industry-standard 256-bit encrypted checkout</p>
                </div>
              </div>
            </section>

            {/* Category Quick Navigation */}
            <section className="home-categories-panel" aria-label="Shop By Category">
              <div className="panel-header">
                <div>
                  <span className="eyebrow eyebrow-small">Browse Collections</span>
                  <h2>Shop by Category</h2>
                </div>
                <Link to="/products" className="text-link">
                  <span>View Full Catalog</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>

              <div className="categories-grid">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.link}
                    className="category-card"
                    aria-label={`Browse ${cat.name}`}
                  >
                    <h3>{cat.name}</h3>
                    <p>{cat.count}</p>
                    <span className="category-card-arrow">
                      <ArrowRightIcon size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Products Showcase */}
            <section className="home-products-panel" aria-label="Featured Products">
              <div className="panel-header">
                <div>
                  <span className="eyebrow eyebrow-small">Top Picks</span>
                  <h2>Featured Products</h2>
                </div>
                <Link to="/products" className="text-link">
                  <span>Explore All</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>

              {loadingProducts ? (
                <div className="home-loading-products">
                  <Spinner size={24} />
                  <span>Loading featured items...</span>
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="home-products-grid">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="home-empty-state">
                  <p>No products available right now. Check back soon!</p>
                </div>
              )}
            </section>

            {/* Account Details & Quick Actions */}
            <section className="profile-card" aria-label="Customer Profile">
              <div className="profile-header">
                <div className="profile-badge">
                  {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="eyebrow eyebrow-small">Account Overview</span>
                  <h2>{customer?.fullName}</h2>
                </div>
              </div>

              <div className="info-list">
                <div className="info-row">
                  <span>Full name</span>
                  <strong>{customer?.fullName}</strong>
                </div>

                <div className="info-row">
                  <span>Email address</span>
                  <strong>{customer?.email}</strong>
                </div>

                <div className="info-row">
                  <span>Contact Phone</span>
                  <strong>{customer?.phone}</strong>
                </div>
              </div>

              <div className="profile-quick-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/orders" className="secondary-button">
                  <PackageIcon size={16} />
                  <span>View Order History</span>
                </Link>
                <Link to="/wishlist" className="secondary-button">
                  <HeartIcon size={16} />
                  <span>Saved Items</span>
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Home;
