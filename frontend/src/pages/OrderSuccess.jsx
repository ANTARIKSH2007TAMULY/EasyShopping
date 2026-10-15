import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { CheckIcon, ArrowRightIcon, Spinner } from '../components/icons';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

function OrderSuccess() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAndFetchOrder = async () => {
      try {
        if (sessionId) {
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: id,
              sessionId,
            });
            if (isMounted && verifyRes.data?.order) {
              setOrder(verifyRes.data.order);
              clearCart();
            }
          } catch {
            // Continue to direct order fetch if verification already handled
          }
        }

        const response = await api.get(`/orders/${id}`);
        if (isMounted) {
          setOrder(response.data.order);
          clearCart();
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyAndFetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, sessionId, clearCart]);

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="content-page">
          <div className="page-loading-wrap">
            <Spinner size={32} />
            <p className="status-text" style={{ marginLeft: '12px' }}>Confirming your order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="content-page">
        <div className="empty-state success-state" style={{ maxWidth: '620px', margin: '48px auto' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '2px solid #a7f3d0',
            }}
          >
            <CheckIcon size={32} />
          </div>

          <span className="eyebrow" style={{ color: '#10b981' }}>Payment Successful</span>
          <h2>Thank You For Your Order!</h2>
          <p style={{ marginTop: '8px', color: 'var(--muted-text)' }}>
            Your order has been placed and confirmed in the ShopKart system.
          </p>

          <div
            style={{
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              margin: '24px 0',
              textAlign: 'left',
              display: 'grid',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--muted-text)' }}>Order ID:</span>
              <strong>{order ? `#${order._id}` : `#${id}`}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--muted-text)' }}>Status:</span>
              <span className="status-badge" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                {order?.status || 'PLACED'}
              </span>
            </div>

            {order?.totalAmount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ fontWeight: 600 }}>Total Paid:</span>
                <strong style={{ color: 'var(--primary-color)' }}>{formatPrice(order.totalAmount)}</strong>
              </div>
            )}
          </div>

          <div className="hero-actions" style={{ justifyContent: 'center', gap: '14px' }}>
            <Link to={`/orders/${id}`} className="primary-button inline-button">
              <span>View Order Details</span>
              <ArrowRightIcon size={16} />
            </Link>
            <Link to="/products" className="secondary-button inline-button">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderSuccess;
