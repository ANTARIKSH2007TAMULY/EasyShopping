import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

function Cart() {
  const { cartItems, loading, error, fetchCart, updateQuantity, removeFromCart, moveToWishlist } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        await fetchCart();
      } catch (err) {
      }

      try {
        await import('../services/api').then((module) => module.default.get('/customers/me'));
      } catch (err) {
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
    if (nextQuantity < 1) {
      return;
    }

    setUpdatingId(productId);
    try {
      await updateQuantity(productId, nextQuantity);
    } catch (err) {
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    try {
      await removeFromCart(productId);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveToWishlist = async (productId) => {
    setUpdatingId(productId);
    setActionMessage('');

    try {
      await moveToWishlist(productId);
      setActionMessage('Moved to wishlist.');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to move product to wishlist.');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="status-text">Loading your cart...</p>;
    }

    if (error) {
      return (
        <div className="empty-state">
          <p>{error}</p>
          <button type="button" className="primary-button" onClick={fetchCart}>
            Try Again
          </button>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="empty-state">
          <h2>Your cart is empty 🛒</h2>
          <p>Looks like you have not added anything yet.</p>
          <Link to="/products" className="primary-button inline-button">
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <div className="cart-layout">
        <div className="cart-items-column">
          {actionMessage && <p className="success-message" style={{ marginBottom: '16px' }}>{actionMessage}</p>}

          {cartItems.map((item) => {
            const product = item.product;
            const quantity = item.quantity;
            const availableStock = Math.max((Number(product?.stock || 0) - Number(quantity || 0)), 0);

            return (
              <div className="cart-item-card" key={product?._id || item.product}>
                <img src={product?.image} alt={product?.name} className="cart-item-image" />

                <div className="cart-item-details">
                  <div className="cart-item-top">
                    <div>
                      <h3>{product?.name}</h3>
                      <p className="cart-item-meta">{product?.category}</p>
                    </div>
                    <p className="cart-item-price">{formatPrice(product?.price || 0)}</p>
                  </div>

                  <div className="cart-item-lower">
                    <div className="quantity-row">
                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => handleQuantityChange(product?._id, quantity - 1)}
                        disabled={quantity <= 1 || updatingId === product?._id}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => handleQuantityChange(product?._id, quantity + 1)}
                        disabled={quantity >= (product?.stock || 0) || updatingId === product?._id}
                      >
                        +
                      </button>
                    </div>

                    <button type="button" className="danger-button" onClick={() => handleRemove(product?._id)} disabled={updatingId === product?._id}>
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-actions" style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleMoveToWishlist(product?._id)}
                      disabled={updatingId === product?._id || !product?._id}
                    >
                      {updatingId === product?._id ? 'Moving...' : 'Move to Wishlist'}
                    </button>
                  </div>

                  <p className={`stock-line ${availableStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {availableStock > 0 ? `${availableStock} available` : 'Out of stock'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="order-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <strong>{totalItems}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <button
            type="button"
            className="primary-button summary-button"
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    );
  };

  return (
    <div className="page-shell">
      <Navbar />
      <div className="content-page">
        <div className="section-heading-row">
          <h1>Shopping Cart</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default Cart;
