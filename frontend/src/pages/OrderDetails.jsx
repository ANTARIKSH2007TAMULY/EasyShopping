import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { ArrowRightIcon, Spinner } from '../components/icons';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.order);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError(err.response?.data?.message || 'Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="page-loading-wrap">
          <Spinner size={32} />
          <p className="status-text" style={{ marginLeft: '12px' }}>Loading order details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="empty-state">
          <p className="error-message">{error}</p>
          <Link to="/orders" className="primary-button inline-button" style={{ marginTop: '16px' }}>
            Back to Orders
          </Link>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="empty-state">
          <h2>Order Not Found</h2>
          <p>We could not locate this order record.</p>
          <Link to="/orders" className="primary-button inline-button">
            View My Orders
          </Link>
        </div>
      );
    }

    return (
      <article className="order-detail-card">
        <div className="order-detail-header">
          <div>
            <span className="eyebrow eyebrow-small">Order Details</span>
            <h2>Order #{order._id}</h2>
          </div>
          <span className="status-badge">{order.status || 'PLACED'}</span>
        </div>

        <div className="info-list order-info-list" style={{ marginTop: '20px' }}>
          <div className="info-row">
            <span>Date Placed</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div className="info-row">
            <span>Payment Status</span>
            <strong style={{ color: '#10b981' }}>{order.paymentStatus || 'COMPLETED'}</strong>
          </div>
          <div className="info-row">
            <span>Total Amount</span>
            <strong style={{ color: 'var(--primary-color)' }}>{formatPrice(order.totalAmount)}</strong>
          </div>
        </div>

        <div className="order-detail-section">
          <h3>Shipping Address</h3>
          <p><strong>{order.shippingAddress?.fullName}</strong></p>
          <p>{order.shippingAddress?.addressLine1}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>Contact Phone: {order.shippingAddress?.phone}</p>
        </div>

        <div className="order-detail-section">
          <h3>Ordered Products</h3>
          <div className="order-product-list">
            {order.items?.map((item) => (
              <div className="order-product-item" key={`${order._id}-${item.product}`}>
                <div className="order-summary-image-wrap">
                  <img src={item.image} alt={item.name} className="order-summary-image" />
                </div>
                <div className="order-product-copy">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Unit Price: {formatPrice(item.price)}</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-color)' }}>
                    Item Total: {formatPrice(Number(item.price) * Number(item.quantity))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
          <Link to="/orders" className="secondary-button">
            <span>← Back to Orders</span>
          </Link>
          <Link to="/products" className="primary-button">
            <span>Continue Shopping</span>
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </article>
    );
  }, [error, loading, order]);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="content-page">
        <div className="section-heading-row">
          <span className="eyebrow">Customer Account</span>
          <h1>Order Summary</h1>
        </div>

        {content}
      </main>

      <Footer />
    </div>
  );
}

export default OrderDetails;
