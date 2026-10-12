import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/wishlist');
      setWishlistItems(response.data.wishlist || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      setError('Unable to load wishlist.');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        await api.get('/customers/me');
      } catch (err) {
        navigate('/login');
        return;
      }

      fetchWishlist();
    };

    checkCustomer();
  }, [navigate]);
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlistItems((current) => current.filter((item) => item._id !== productId));
    } catch (err) {
      setError('Unable to remove product from wishlist.');
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return <p className="status-text">Loading your wishlist...</p>;
    }

    if (error) {
      return (
        <div className="empty-state">
          <p>{error}</p>
          <button type="button" className="primary-button" onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      );
    }

    if (wishlistItems.length === 0) {
      return (
        <div className="empty-state">
          <h2>Your wishlist is empty ❤️</h2>
          <p>Start saving products you love.</p>
          <Link to="/products" className="primary-button inline-button">
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <div className="wishlist-card" key={item._id}>
            <img src={item.image} alt={item.name} className="wishlist-image" />
            <div className="wishlist-card-body">
              <div className="wishlist-card-header">
                <div>
                  <h3>{item.name}</h3>
                  <p className="wishlist-category">{item.category}</p>
                </div>
                <span className={`stock-badge ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {item.stock > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </div>

              <p className="wishlist-price">{formatPrice(item.price)}</p>

              <div className="wishlist-actions">
                <button type="button" className="secondary-button" onClick={() => navigate(`/products/${item._id}`)}>
                  View Details
                </button>
                <button type="button" className="danger-button" onClick={() => handleRemove(item._id)}>
                  Remove from Wishlist
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [error, loading, navigate, wishlistItems]);

  return (
    <div className="page-shell">
      <Navbar />
      <div className="content-page">
        <div className="section-heading-row">
          <h1>My Wishlist</h1>
        </div>
        {content}
      </div>
    </div>
  );
}

export default Wishlist;
