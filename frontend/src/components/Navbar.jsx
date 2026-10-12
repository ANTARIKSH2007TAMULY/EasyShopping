

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout', {});
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };















































































  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/home">ShopKart</Link>
      </div>

      <div className="nav-links">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/wishlist" className="nav-link">Wishlist</Link>
        <Link to="/orders" className="nav-link">Orders</Link>
        <Link to="/cart" className="nav-link cart-link">
          Cart {cartCount > 0 ? `(${cartCount})` : ''}
        </Link>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <p className="error-message navbar-error">{error}</p>}
    </nav>
  );
}

export default Navbar;
