import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { ShieldCheckIcon, TruckIcon, LockIcon } from '../components/icons';

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
  const [searchParams] = useSearchParams();
  const { cartItems, loading, error: cartError, fetchCart } = useCart();
  const [shipping, setShipping] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(() =>
    searchParams.get('canceled') === 'true'
      ? 'Payment was canceled on Stripe. Your cart items are preserved.'
      : ''
  );

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        await api.get('/customers/me');
      } catch {
        navigate('/login');
        return;
      }

      await fetchCart();
    };

    verifyAccess();
  }, [fetchCart, navigate]);

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
      setCheckoutError('Please complete all required shipping fields.');
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

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Unable to initialize Stripe checkout session.');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || err.message || 'Unable to create payment order.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="content-page">
          <p className="status-text">Loading checkout details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartError || cartItems.length === 0) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="content-page">
          <div className="empty-state">
            <h2>Your Cart is Empty</h2>
            <p>Add products to your cart before proceeding to checkout.</p>
            <Link to="/products" className="primary-button inline-button">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="content-page checkout-page">
        <div className="section-heading-row">
          <span className="eyebrow">Final Step</span>
          <h1>Checkout & Payment</h1>
        </div>

        <div className="checkout-layout">
          <section className="checkout-card" aria-label="Shipping Address">
            <h2>Delivery Address</h2>

            <div className="checkout-form">
              <div className="field-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  value={shipping.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  autoComplete="name"
                />
                {formErrors.fullName && <span className="field-error">{formErrors.fullName}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  value={shipping.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                />
                {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="addressLine1">Street Address</label>
                <input
                  id="addressLine1"
                  value={shipping.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  placeholder="Apartment, suite, street address"
                  autoComplete="street-address"
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
                    placeholder="e.g. Bengaluru"
                    autoComplete="address-level2"
                  />
                  {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    value={shipping.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="e.g. Karnataka"
                    autoComplete="address-level1"
                  />
                  {formErrors.state && <span className="field-error">{formErrors.state}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="pincode">Pincode (Postal Code)</label>
                <input
                  id="pincode"
                  value={shipping.pincode}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  placeholder="6-digit PIN code"
                  autoComplete="postal-code"
                />
                {formErrors.pincode && <span className="field-error">{formErrors.pincode}</span>}
              </div>
            </div>
          </section>

          <aside className="order-summary-card checkout-summary-card" aria-label="Order Summary">
            <h2>Order Summary</h2>

            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div className="order-summary-item" key={item.product?._id || item.product}>
                  <div className="order-summary-image-wrap">
                    <img src={item.product?.image} alt={item.product?.name} className="order-summary-image" />
                  </div>
                  <div className="order-summary-details">
                    <h3>{item.product?.name}</h3>
                    <p>Qty: {item.quantity}</p>
                    <p style={{ fontWeight: 700, color: 'var(--text-color)' }}>
                      {formatPrice(Number(item.product?.price || 0) * Number(item.quantity || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row" style={{ marginTop: '16px' }}>
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Standard Delivery</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>FREE</span>
            </div>

            <div className="summary-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '8px', paddingTop: '16px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Payable</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--primary-color)' }}>{formatPrice(subtotal)}</strong>
            </div>

            {checkoutError && (
              <div className="error-message" role="alert" style={{ marginTop: '16px' }}>
                <span>{checkoutError}</span>
              </div>
            )}

            <button
              type="button"
              className="primary-button summary-button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Redirecting to Stripe...' : 'Proceed to Stripe Payment'}
            </button>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LockIcon size={15} />
                <span>Encrypted, test-mode payment gateway</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TruckIcon size={15} />
                <span>Express dispatch across India upon confirmation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheckIcon size={15} />
                <span>ShopKart Buyer Guarantee</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
