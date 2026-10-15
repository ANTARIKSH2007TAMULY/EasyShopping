import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import {
  CartIcon,
  TrashIcon,
  HeartIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  Spinner,
} from '../components/icons';

function Cart() {
  const { cartItems, loading, error, fetchCart, updateQuantity, removeFromCart, moveToWishlist } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        await fetchCart();
      } catch {
        // Handled in context
      }

      try {
        await api.get('/customers/me');
      } catch {
        navigate('/login');
      }
    };

    checkCustomer();
  }, [fetchCart, navigate]);

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const handleQuantityChange = async (productId, nextQuantity) => {
    if (nextQuantity < 1) return;

    setUpdatingId(productId);
    try {
      await updateQuantity(productId, nextQuantity);
    } catch {
      // Handled in context
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    try {
      await removeFromCart(productId);
      setActionMessage('Item removed from cart.');
      setTimeout(() => setActionMessage(''), 2500);
    } catch {
      // Handled in context
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveToWishlist = async (productId) => {
    setUpdatingId(productId);
    try {
      await moveToWishlist(productId);
      setActionMessage('Item moved to your wishlist.');
      setTimeout(() => setActionMessage(''), 2500);
    } catch {
      // Handled in context
    } finally {
      setUpdatingId(null);
    }
  };

  const renderContent = () => {
    if (loading && cartItems.length === 0) {
      return (
        <div className="page-loading-wrap">
          <Spinner size={32} />
          <p className="status-text" style={{ marginLeft: '12px' }}>Loading your cart...</p>
        </div>
      );
    }

    if (error && cartItems.length === 0) {
      return (
        <div className="empty-state">
          <p className="error-message">{error}</p>
          <button type="button" className="primary-button" onClick={fetchCart} style={{ marginTop: '16px' }}>
            Try Again
          </button>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="empty-state">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--muted-text)' }}>
            <CartIcon size={44} />
          </div>
          <h2>Your Cart is Currently Empty</h2>
          <p>Explore our catalog to find premium products and add them to your cart.</p>
          <Link to="/products" className="primary-button inline-button">
            <span>Start Shopping</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      );
    }

    return (
      <div className="cart-layout">
        <div className="cart-items-column">
          {actionMessage && <p className="success-message" style={{ marginBottom: '12px' }}>{actionMessage}</p>}

          {cartItems.map((item) => {
            const product = item.product;
            const quantity = item.quantity;
            const availableStock = Math.max(Number(product?.stock || 0) - Number(quantity || 0), 0);
            const isUpdating = updatingId === (product?._id || item.product);

            return (
              <article className="cart-item-card" key={product?._id || item.product}>
                <img
                  src={product?.image}
                  alt={product?.name || 'Product'}
                  className="cart-item-image"
                  onClick={() => product?._id && navigate(`/products/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                />

                <div className="cart-item-details">
                  <div className="cart-item-top">
                    <div>
                      <h3
                        onClick={() => product?._id && navigate(`/products/${product._id}`)}
                        style={{ cursor: 'pointer' }}
                        title={product?.name}
                      >
                        {product?.name}
                      </h3>
                      <p className="cart-item-meta">{product?.category}</p>
                    </div>
                    <p className="cart-item-price">{formatPrice(Number(product?.price || 0) * Number(quantity || 1))}</p>
                  </div>

                  <div className="cart-item-lower">
                    <div className="quantity-row">
                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => handleQuantityChange(product?._id, quantity - 1)}
                        disabled={quantity <= 1 || isUpdating}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                        {isUpdating ? <Spinner size={12} /> : quantity}
                      </span>

                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => handleQuantityChange(product?._id, quantity + 1)}
                        disabled={quantity >= (product?.stock || 0) || isUpdating}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => handleMoveToWishlist(product?._id)}
                        disabled={isUpdating || !product?._id}
                        title="Save to wishlist and remove from cart"
                      >
                        <HeartIcon size={14} />
                        <span>Move to Wishlist</span>
                      </button>

                      <button
                        type="button"
                        className="danger-button small-button"
                        onClick={() => handleRemove(product?._id)}
                        disabled={isUpdating}
                        title="Remove from cart"
                      >
                        <TrashIcon size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <p className={`stock-line ${availableStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {availableStock > 0 ? `${availableStock} units remaining` : 'Maximum available in cart'}
                  </p>
                </div>
              </article>
            );
          })}

          <div style={{ marginTop: '8px' }}>
            <Link to="/products" className="secondary-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        <aside className="order-summary-card" aria-label="Order Summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Standard Shipping</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>FREE</span>
          </div>

          <div className="summary-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '8px', paddingTop: '16px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading-color)' }}>Order Total</span>
            <strong style={{ fontSize: '1.35rem', color: 'var(--primary-color)' }}>{formatPrice(subtotal)}</strong>
          </div>

          <button
            type="button"
            className="primary-button summary-button"
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
            aria-label="Proceed to checkout"
          >
            <span>Proceed to Checkout</span>
            <ArrowRightIcon size={16} />
          </button>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--muted-text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheckIcon size={16} />
              <span>Guaranteed secure payment processing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TruckIcon size={16} />
              <span>Free express delivery on all orders</span>
            </div>
          </div>
        </aside>
      </div>
    );
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="content-page">
        <div className="section-heading-row">
          <span className="eyebrow">Checkout Preparation</span>
          <h1>Shopping Cart</h1>
        </div>

        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
