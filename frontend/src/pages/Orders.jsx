import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

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

        setError('Unable to load your orders right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const content = useMemo(() => {
    if (loading) {
      return <p className="status-text">Loading your orders...</p>;
    }

    if (error) {
      return (
        <div className="empty-state">
          <p>{error}</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className="empty-state">
          <h2>You have not placed any orders yet.</h2>
          <p>Start shopping to see your purchase history here.</p>
          <Link to="/products" className="primary-button inline-button">Start Shopping</Link>
        </div>
      );
    }

    return (
      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <div>
                <p className="eyebrow eyebrow-small">Order ID</p>
                <h3>{order._id.slice(-8).toUpperCase()}</h3>
              </div>
              <span className="status-badge">{order.status}</span>
            </div>

            <div className="info-list order-info-list">
              <div className="info-row">
                <span>Date</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <div className="info-row small-row">
                <span>Total</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
              <div className="info-row small-row">
                <span>Payment</span>
                <strong>{order.paymentStatus}</strong>
              </div>
            </div>

            <div className="order-card-footer">
              <p>{order.items?.length || 0} item(s)</p>
              <button type="button" className="secondary-button" onClick={() => navigate(`/orders/${order._id}`)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }, [error, loading, navigate, orders]);

  return (
    <div className="page-shell">
      <Navbar />
      <div className="content-page">
        <div className="section-heading-row">
          <h1>My Orders</h1>
        </div>
        {content}
      </div>
    </div>
  );
}

export default Orders;
