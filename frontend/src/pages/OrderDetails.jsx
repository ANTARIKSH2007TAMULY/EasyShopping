import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

        setError(err.response?.data?.message || 'Unable to load this order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const content = useMemo(() => {
    if (loading) {
      return <p className="status-text">Loading order details...</p>;
    }

    if (error) {
      return (
        <div className="empty-state">
          <p>{error}</p>
          <Link to="/orders" className="primary-button inline-button">Back to Orders</Link>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="empty-state">
          <h2>Order not found</h2>
          <Link to="/orders" className="primary-button inline-button">View My Orders</Link>
        </div>
      );
    }

    return (
      <div className="order-detail-card">
        <div className="order-detail-header">
          <div>
            <p className="eyebrow eyebrow-small">Order ID</p>
            <h2>{order._id}</h2>
          </div>
          <span className="status-badge">{order.status}</span>
        </div>

        <div className="info-list order-info-list">
          <div className="info-row">
            <span>Placed</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div className="info-row small-row">
            <span>Payment</span>
            <strong>{order.paymentStatus}</strong>
          </div>
          <div className="info-row small-row">
            <span>Total</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </div>

        <div className="order-detail-section">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.addressLine1}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
          <p>{order.shippingAddress?.pincode}</p>
          <p>Phone: {order.shippingAddress?.phone}</p>
        </div>

        <div className="order-detail-section">
          <h3>Products</h3>
          <div className="order-product-list">
            {order.items?.map((item) => (
              <div className="order-product-item" key={`${order._id}-${item.product}`}>
                <div className="order-summary-image-wrap">
                  <img src={item.image} alt={item.name} className="order-summary-image" />
                </div>
                <div className="order-product-copy">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: {formatPrice(item.price)}</p>
                  <p>Subtotal: {formatPrice(Number(item.price) * Number(item.quantity))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [error, loading, navigate, order]);

  return (
    <div className="page-shell">
      <Navbar />
      <div className="content-page">
        <div className="section-heading-row">
          <h1>Order Details</h1>
        </div>
        {content}
      </div>
    </div>
  );
}

export default OrderDetails;
