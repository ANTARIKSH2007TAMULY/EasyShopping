import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import {
  HeartIcon,
  CartIcon,
  TrashIcon,
  Spinner,
  ArrowRightIcon,
} from '../components/icons';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartAddingId, setCartAddingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({});
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const loadWishlist = async () => {
      try {
        const response = await api.get('/wishlist');
        if (!isCancelled) {
          setWishlistItems(response.data.wishlist || []);
          setError('');
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.response?.status === 401) {
            navigate('/login');
            return;
          }
          setError('Unable to load your saved wishlist.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadWishlist();
    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlistItems(response.data.wishlist || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Unable to load your saved wishlist.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlistItems((current) => current.filter((item) => item._id !== productId));
    } catch {
      setError('Unable to remove item from wishlist.');
    }
  };

  const handleAddToCart = async (product) => {
    if (cartAddingId === product._id || product.stock === 0) return;

    try {
      setCartAddingId(product._id);
      await addToCart(product._id);
      setActionFeedback((prev) => ({ ...prev, [product._id]: 'Added to Cart ✓' }));
      setTimeout(() => {
        setActionFeedback((prev) => {
          const next = { ...prev };
          delete next[product._id];
          return next;
        });
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add';
      setActionFeedback((prev) => ({ ...prev, [product._id]: msg }));
      setTimeout(() => {
        setActionFeedback((prev) => {
          const next = { ...prev };
          delete next[product._id];
          return next;
        });
      }, 2500);
    } finally {
      setCartAddingId(null);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="content-page">
        <div className="section-heading-row">
          <span className="eyebrow">Personal Collection</span>
          <h1>My Wishlist</h1>
        </div>

        {loading ? (
          <div className="page-loading-wrap">
            <Spinner size={32} />
            <p className="status-text" style={{ marginLeft: '12px' }}>Loading your saved items...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={fetchWishlist}
              style={{ marginTop: '16px' }}
            >
              Try Again
            </button>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="empty-state">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--muted-text)' }}>
              <HeartIcon size={44} />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save items you love so you can easily track or purchase them later.</p>
            <Link to="/products" className="primary-button inline-button">
              <span>Explore Catalog</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const isAdding = cartAddingId === item._id;
              const feedback = actionFeedback[item._id];

              return (
                <article className="wishlist-card" key={item._id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="wishlist-image"
                    onClick={() => navigate(`/products/${item._id}`)}
                    style={{ cursor: 'pointer' }}
                  />

                  <div className="wishlist-card-body">
                    <div className="wishlist-card-header">
                      <div>
                        <h3
                          onClick={() => navigate(`/products/${item._id}`)}
                          style={{ cursor: 'pointer' }}
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="wishlist-category">{item.category}</p>
                      </div>

                      <span className={`stock-badge ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <p className="wishlist-price">{formatPrice(item.price)}</p>

                    <div className="wishlist-actions">
                      <button
                        type="button"
                        className={`primary-button small-button ${feedback?.includes('✓') ? 'btn-success' : ''}`}
                        onClick={() => handleAddToCart(item)}
                        disabled={isAdding || item.stock === 0}
                      >
                        {isAdding ? (
                          <>
                            <Spinner size={14} />
                            <span>Adding...</span>
                          </>
                        ) : feedback ? (
                          <span>{feedback}</span>
                        ) : (
                          <>
                            <CartIcon size={15} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="danger-button small-button"
                        onClick={() => handleRemove(item._id)}
                        title="Remove from wishlist"
                      >
                        <TrashIcon size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;
