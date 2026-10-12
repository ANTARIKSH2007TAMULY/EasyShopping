import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="content-page">
          <p className="status-text">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <div className="content-page">
        <div className="empty-state success-state">
          <h2>Order placed successfully</h2>
          <p>{order ? `Order ID: ${order._id}` : `Order ID: ${id}`}</p>
          <p>{order ? `Total: ${formatPrice(order.totalAmount)}` : 'Payment confirmed.'}</p>
          <p>Status: {order?.status || 'PLACED'}</p>

          <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '18px' }}>
            <Link to="/orders" className="primary-button inline-button">View My Orders</Link>
            <Link to="/products" className="secondary-button inline-button">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
