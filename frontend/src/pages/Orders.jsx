import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { PackageIcon, ArrowRightIcon, Spinner } from '../components/icons';

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

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await api.get('/customers/me');
        const response = await api.get('/orders');
        setOrders(response.data.orders || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError('Unable to load your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="page-loading-wrap">
          <Spinner size={32} />
          <p className="status-text" style={{ marginLeft: '12px' }}>Loading your orders...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="empty-state">
          <p className="error-message">{error}</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
            Try Again
          </button>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className="empty-state">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--muted-text)' }}>
            <PackageIcon size={44} />
          </div>
          <h2>No Orders Placed Yet</h2>
          <p>When you complete a purchase, your order history and tracking details will appear here.</p>
          <Link to="/products" className="primary-button inline-button">
            <span>Explore Products</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      );
    }

    return (
      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order._id}>
            <div className="order-card-header">
              <div>
                <span className="eyebrow eyebrow-small">Order Ref</span>
                <h3>#{order._id.slice(-8).toUpperCase()}</h3>
              </div>
              <span className="status-badge">{order.status || 'PLACED'}</span>
            </div>

            <div className="info-list order-info-list">
              <div className="info-row">
                <span>Order Placed</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <div className="info-row">
                <span>Total Amount</span>
                <strong style={{ color: 'var(--primary-color)' }}>{formatPrice(order.totalAmount)}</strong>
              </div>
              <div className="info-row">
                <span>Payment Status</span>
                <strong>{order.paymentStatus || 'COMPLETED'}</strong>
              </div>
            </div>

            <div className="order-card-footer">
              <p>{order.items?.length || 0} product{order.items?.length === 1 ? '' : 's'} included</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <span>View Details</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }, [error, loading, navigate, orders]);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="content-page">
        <div className="section-heading-row">
          <span className="eyebrow">Customer Account</span>
          <h1>My Orders</h1>
        </div>

        {content}
      </main>

      <Footer />
    </div>
  );
}

export default Orders;
