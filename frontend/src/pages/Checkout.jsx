import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const initialForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, error: cartError, fetchCart, clearCart } = useCart();
  const [shipping, setShipping] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isRazorpayReady, setIsRazorpayReady] = useState(Boolean(window.Razorpay));

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        await api.get('/customers/me');
      } catch (err) {
        navigate('/login');
        return;
      }

      await fetchCart();
    };

    verifyAccess();
  }, [fetchCart, navigate]);

  useEffect(() => {
    if (window.Razorpay) {
      setIsRazorpayReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => setIsRazorpayReady(false);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const updateField = (field, value) => {
    setShipping((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};

    Object.entries(shipping).forEach(([field, value]) => {
      if (!String(value).trim()) {
        nextErrors[field] = 'This field is required.';
      }
    });

    if (shipping.fullName && shipping.fullName.trim().length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (shipping.phone && !/^(\+?\d{10,15})$/.test(shipping.phone.trim())) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }

    if (shipping.pincode && !/^\d{6}$/.test(shipping.pincode.trim())) {
      nextErrors.pincode = 'Pincode must contain exactly 6 digits.';
    }

    return nextErrors;
  };

  const handlePlaceOrder = async () => {
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setCheckoutError('Please correct the highlighted shipping details.');
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty. Add products before checkout.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError('');

    try {
      const response = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: shipping.fullName.trim(),
          phone: shipping.phone.trim(),
          addressLine1: shipping.addressLine1.trim(),
          city: shipping.city.trim(),
          state: shipping.state.trim(),
          pincode: shipping.pincode.trim(),
        },
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = response.data;

      if (!window.Razorpay || !isRazorpayReady) {
        throw new Error('Razorpay checkout is not available right now.');
      }

      const options = {
        key,
        amount,
        currency,
        name: 'ShopKart',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (paymentResponse) => {
          try {
            const verification = await api.post('/orders/verify-payment', {
              shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            clearCart();
            navigate(`/order-success/${shopKartOrderId}`, {
              state: { order: verification.data.order },
            });
          } catch (err) {
            setCheckoutError(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutError('Payment was not completed. Your cart remains unchanged.');
            setIsSubmitting(false);
          },
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.open();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || err.message || 'Unable to create your order.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="content-page">
          <p className="status-text">Loading your checkout...</p>
        </div>
      </div>
    );
  }

  if (cartError || cartItems.length === 0) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="content-page">
          <div className="empty-state">
            <h2>Your cart is empty 🛒</h2>
            <p>Complete your order with products in your cart.</p>
            <Link to="/products" className="primary-button inline-button">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <div className="content-page checkout-page">
        <div className="section-heading-row">
          <h1>Checkout</h1>
        </div>

        <div className="checkout-layout">
          <div className="checkout-card">
            <h2>Shipping Details</h2>

            <div className="checkout-form">
              <div className="field-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  value={shipping.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Aarav Sharma"
                />
                {formErrors.fullName && <span className="field-error">{formErrors.fullName}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  value={shipping.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="9876543210"
                />
                {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="addressLine1">Address</label>
                <input
                  id="addressLine1"
                  value={shipping.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  placeholder="22 MG Road"
                />
                {formErrors.addressLine1 && <span className="field-error">{formErrors.addressLine1}</span>}
              </div>

              <div className="checkout-grid-two">
                <div className="field-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    value={shipping.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Bengaluru"
                  />
                  {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    value={shipping.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="Karnataka"
                  />
                  {formErrors.state && <span className="field-error">{formErrors.state}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  value={shipping.pincode}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  placeholder="560001"
                />
                {formErrors.pincode && <span className="field-error">{formErrors.pincode}</span>}
              </div>
            </div>
          </div>

          <aside className="order-summary-card checkout-summary-card">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div className="order-summary-item" key={item.product?._id || item.product}>
                <div className="order-summary-image-wrap">
                  <img src={item.product?.image} alt={item.product?.name} className="order-summary-image" />
                </div>
                <div className="order-summary-details">
                  <h3>{item.product?.name}</h3>
                  <p>Qty: {item.quantity}</p>
                  <p>{formatPrice(Number(item.product?.price || 0) * Number(item.quantity || 0))}</p>
                </div>
              </div>
            ))}

            <div className="summary-row">
              <span>Items</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {checkoutError && <p className="error-message" style={{ marginTop: '16px' }}>{checkoutError}</p>}

            <button
              type="button"
              className="primary-button summary-button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !isRazorpayReady}
            >
              {isSubmitting ? 'Processing...' : 'Pay with Razorpay'}
            </button>

            {!isRazorpayReady && (
              <p className="status-text" style={{ marginTop: '12px' }}>Loading Razorpay checkout...</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
