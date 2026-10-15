import { Link } from 'react-router-dom';
import { LogoIcon, ShieldCheckIcon, TruckIcon, RefreshIcon } from './icons';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top-strip">
        <div className="footer-container">
          <div className="footer-perks-grid">
            <div className="footer-perk-item">
              <div className="footer-perk-icon">
                <TruckIcon size={22} />
              </div>
              <div className="footer-perk-copy">
                <h4>Free & Fast Delivery</h4>
                <p>Swift dispatch on all curated orders across India</p>
              </div>
            </div>

            <div className="footer-perk-item">
              <div className="footer-perk-icon">
                <ShieldCheckIcon size={22} />
              </div>
              <div className="footer-perk-copy">
                <h4>100% Genuine Products</h4>
                <p>Direct from verified makers and certified brands</p>
              </div>
            </div>

            <div className="footer-perk-item">
              <div className="footer-perk-icon">
                <RefreshIcon size={22} />
              </div>
              <div className="footer-perk-copy">
                <h4>Hassle-Free Returns</h4>
                <p>7-day replacement policy on eligible items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-container footer-main-grid">
          <div className="footer-col footer-col-brand">
            <Link to="/home" className="footer-brand" aria-label="EasyShopping Homepage">
              <LogoIcon size={30} />
              <span className="footer-brand-name">EasyShopping</span>
            </Link>
            <p className="footer-brand-desc">
              Your destination for curated, premium lifestyle, tech, and everyday essentials designed for modern living.
            </p>
            <div className="footer-secure-tag">
              <ShieldCheckIcon size={16} />
              <span>Verified Secure Payments via Stripe</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Shop Collections</h4>
            <ul className="footer-links">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=Electronics">Electronics & Audio</Link></li>
              <li><Link to="/products?category=Fashion">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Home">Home & Living</Link></li>
              <li><Link to="/products?category=Sports">Fitness & Outdoors</Link></li>
              <li><Link to="/products?category=Beauty">Beauty & Self-Care</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Account & Orders</h4>
            <ul className="footer-links">
              <li><Link to="/home">Account Dashboard</Link></li>
              <li><Link to="/orders">Order History</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/checkout">Fast Checkout</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Trust & Security</h4>
            <p className="footer-text-muted">
              EasyShopping delivers high-performance e-commerce with real-time stock tracking, encrypted customer authentication, and instant Stripe test-mode processing.
            </p>
            <div className="footer-payment-badges">
              <span className="payment-badge">Stripe</span>
              <span className="payment-badge">Visa</span>
              <span className="payment-badge">Mastercard</span>
              <span className="payment-badge">UPI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p>© {new Date().getFullYear()} EasyShopping Inc. All rights reserved.</p>
          <p className="footer-env-note">Simulated Production Environment • Stripe Test Mode Active</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
