import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { HeartIcon, CartIcon, Spinner } from './icons';

// ProductCard represents a single catalog item with clean, accessible interactions.
function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Price formatting keeps Indian currency display consistent across the storefront.
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Saves the product to the authenticated user's wishlist.
  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      setWishlistMessage('');
      await api.post(`/wishlist/${product._id}`);
      setIsWishlisted(true);
      setWishlistMessage('Saved to Wishlist');
      setTimeout(() => setWishlistMessage(''), 2500);
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setWishlistMessage('Already in wishlist');
      } else {
        setWishlistMessage('Unable to save');
      }
      setTimeout(() => setWishlistMessage(''), 2500);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Shared cart context lets the same action work from product card and details page.
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (cartLoading || product.stock === 0) return;

    try {
      setCartLoading(true);
      setCartMessage('');
      setCartSuccess(false);
      await addToCart(product._id);
      setCartSuccess(true);
      setCartMessage('Added to Cart');
      setTimeout(() => {
        setCartSuccess(false);
        setCartMessage('');
      }, 2500);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add';
      setCartMessage(message);
      setTimeout(() => setCartMessage(''), 2500);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${product._id}`)}
      tabIndex={0}
      role="region"
      aria-label={product.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/products/${product._id}`);
      }}
    >
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {product.category && (
          <span className="product-category-tag">{product.category}</span>
        )}

        <button
          type="button"
          className={`product-wishlist-toggle ${isWishlisted ? 'active' : ''}`}
          onClick={handleAddToWishlist}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          title="Save to wishlist"
        >
          {wishlistLoading ? (
            <Spinner size={16} />
          ) : (
            <HeartIcon size={17} filled={isWishlisted} />
          )}
        </button>

        {product.stock === 0 && (
          <div className="product-sold-out-overlay">
            <span>Sold Out</span>
          </div>
        )}
      </div>

      <div className="product-card-content">
        <h3 title={product.name}>{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>

        <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
          {product.stock > 0
            ? product.stock < 15
              ? `Only ${product.stock} units left`
              : 'In stock'
            : 'Out of stock'}
        </p>

        <div className="product-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}`);
            }}
          >
            Details
          </button>

          <button
            type="button"
            className={`primary-button small-button ${cartSuccess ? 'btn-success' : ''}`}
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
          >
            {cartLoading ? (
              <>
                <Spinner size={14} />
                <span>Adding...</span>
              </>
            ) : cartSuccess ? (
              <span>✓ Added</span>
            ) : (
              <>
                <CartIcon size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {wishlistMessage && <p className="inline-feedback wishlist-feedback">{wishlistMessage}</p>}
        {cartMessage && (
          <p className={`inline-feedback ${cartSuccess ? 'cart-feedback' : 'error-message'}`}>
            {cartMessage}
          </p>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
