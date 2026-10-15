import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import api, { getProductById } from '../services/api';
import {
  CartIcon,
  HeartIcon,
  Spinner,
  ShieldCheckIcon,
  TruckIcon,
  RefreshIcon,
  LockIcon,
  ArrowRightIcon,
} from '../components/icons';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        if (!isCancelled) {
          setProduct(response.data);
          setError('');
        }
      } catch {
        if (!isCancelled) {
          setError('Unable to load product details.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        await api.get('/customers/me');
      } catch {
        navigate('/login');
      }
    };
    checkCustomer();
  }, [navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || !product || product.stock === 0) return;

    try {
      setIsAddingToCart(true);
      setCartMessage('');
      setCartSuccess(false);
      await addToCart(product._id);
      setCartSuccess(true);
      setCartMessage('Item added to your shopping cart');
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setCartMessage(err.response?.data?.message || 'Unable to add product to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (wishlistLoading || !product) return;

    try {
      setWishlistLoading(true);
      setWishlistMessage('');
      await api.post(`/wishlist/${product._id}`);
      setIsWishlisted(true);
      setWishlistMessage('Added to your Wishlist');
      setTimeout(() => setWishlistMessage(''), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setWishlistMessage('Already in wishlist');
      } else {
        setWishlistMessage('Unable to save product to wishlist.');
      }
      setTimeout(() => setWishlistMessage(''), 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="product-details-page-container">
      <Navbar />

      <main className="product-details-page">
        {loading ? (
          <div className="page-loading-wrap">
            <Spinner size={32} />
            <p className="status-text" style={{ marginLeft: '12px' }}>Loading product details...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="error-message">{error}</p>
            <Link to="/products" className="primary-button inline-button" style={{ marginTop: '16px' }}>
              Return to Products
            </Link>
          </div>
        ) : !product ? (
          <div className="empty-state">
            <h2>Product Not Found</h2>
            <p>The product you requested might have been discontinued or moved.</p>
            <Link to="/products" className="primary-button inline-button">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <article className="product-details-card">
            {/* Left Column: Image & Assurance */}
            <div className="product-details-media">
              <img
                src={product.image}
                alt={product.name}
                className="product-details-image"
              />

              <div className="details-perks-list" style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                <div className="details-perk-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted-text)', fontSize: '0.88rem' }}>
                  <TruckIcon size={18} />
                  <span>Free, tracked delivery across India</span>
                </div>
                <div className="details-perk-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted-text)', fontSize: '0.88rem' }}>
                  <ShieldCheckIcon size={18} />
                  <span>100% Genuine, authentic products</span>
                </div>
                <div className="details-perk-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted-text)', fontSize: '0.88rem' }}>
                  <RefreshIcon size={18} />
                  <span>7-Day replacement guarantee</span>
                </div>
                <div className="details-perk-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted-text)', fontSize: '0.88rem' }}>
                  <LockIcon size={18} />
                  <span>Encrypted Stripe checkout</span>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Purchase Controls */}
            <div className="product-details-info">
              {product.category && (
                <span className="eyebrow">{product.category}</span>
              )}

              <h1>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <p className="product-price">{formatPrice(product.price)}</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>Inclusive of all taxes</span>
              </div>

              <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
                {product.stock > 0
                  ? product.stock < 15
                    ? `Low Stock: Only ${product.stock} units left in warehouse`
                    : `In Stock (${product.stock} units available)`
                  : 'Currently Out of Stock'}
              </p>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Product Description</h3>
                <p className="product-description">{product.description}</p>
              </div>

              <div className="details-specs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '4px' }}>
                <div className="info-row">
                  <span>Category</span>
                  <strong>{product.category}</strong>
                </div>
                <div className="info-row">
                  <span>Available Stock</span>
                  <strong>{product.stock} units</strong>
                </div>
                <div className="info-row">
                  <span>Dispatch</span>
                  <strong>24-48 Hours</strong>
                </div>
              </div>

              <div className="details-actions">
                <button
                  type="button"
                  className={`primary-button ${cartSuccess ? 'btn-success' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {isAddingToCart ? (
                    <>
                      <Spinner size={18} />
                      <span>Adding to Cart...</span>
                    </>
                  ) : cartSuccess ? (
                    <span>✓ Added to Cart</span>
                  ) : (
                    <>
                      <CartIcon size={18} />
                      <span>Add to Cart — {formatPrice(product.price)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`wishlist-button ${isWishlisted ? 'wishlisted' : ''}`}
                  onClick={handleAddToWishlist}
                  disabled={wishlistLoading}
                  aria-label="Save to wishlist"
                >
                  {wishlistLoading ? (
                    <Spinner size={16} />
                  ) : (
                    <HeartIcon size={18} filled={isWishlisted} />
                  )}
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {cartMessage && (
                <div className={cartSuccess ? 'success-message' : 'error-message'} style={{ marginTop: '12px' }}>
                  <span>{cartMessage}</span>
                  {cartSuccess && (
                    <Link to="/cart" style={{ marginLeft: 'auto', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>View Cart</span>
                      <ArrowRightIcon size={14} />
                    </Link>
                  )}
                </div>
              )}

              {wishlistMessage && (
                <div className="success-message" style={{ marginTop: '8px' }}>
                  <span>{wishlistMessage}</span>
                  <Link to="/wishlist" style={{ marginLeft: 'auto', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>View Wishlist</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              )}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;
