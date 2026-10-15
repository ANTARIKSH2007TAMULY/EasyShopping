import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import {
  LogoIcon,
  CartIcon,
  HeartIcon,
  PackageIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from './icons';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout', {});
      navigate('/login');
    } catch {
      setError('Logout failed. Please try again.');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <div className="nav-brand">
          <Link to="/home" aria-label="ShopKart Homepage">
            <LogoIcon size={30} />
            <span>ShopKart</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-nav">
          <Link
            to="/home"
            className={`nav-link ${isActive('/home') ? 'active' : ''}`}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={`nav-link ${isActive('/products') ? 'active' : ''}`}
          >
            Products
          </Link>

          <Link
            to="/wishlist"
            className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}
            aria-label="Saved Wishlist"
          >
            <HeartIcon size={17} />
            <span>Wishlist</span>
          </Link>

          <Link
            to="/orders"
            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
            aria-label="Order History"
          >
            <PackageIcon size={17} />
            <span>Orders</span>
          </Link>

          <Link
            to="/cart"
            className={`nav-link cart-link ${isActive('/cart') ? 'active' : ''}`}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <CartIcon size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Log out of ShopKart"
            aria-label="Log out"
          >
            <LogoutIcon size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Nav Button */}
        <div className="mobile-nav-actions">
          <Link
            to="/cart"
            className="nav-link cart-link mobile-cart-icon"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <CartIcon size={20} />
            {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer" role="dialog" aria-label="Mobile Navigation">
          <Link
            to="/home"
            className={`mobile-nav-link ${isActive('/home') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`mobile-nav-link ${isActive('/products') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/wishlist"
            className={`mobile-nav-link ${isActive('/wishlist') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <HeartIcon size={18} />
            <span>Wishlist</span>
          </Link>
          <Link
            to="/orders"
            className={`mobile-nav-link ${isActive('/orders') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <PackageIcon size={18} />
            <span>Order History</span>
          </Link>
          <button
            type="button"
            className="mobile-nav-link mobile-logout-link"
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
          >
            <LogoutIcon size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {error && <p className="error-message navbar-error">{error}</p>}
    </header>
  );
}

export default Navbar;
