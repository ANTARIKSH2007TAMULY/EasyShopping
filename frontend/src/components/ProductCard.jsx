import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

// ProductCard represents a single catalog item and includes actions like view details, wishlist, and add-to-cart.
function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Price formatting keeps Indian currency display consistent across the storefront.
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Saves the product to the authenticated user's wishlist.
  const handleAddToWishlist = async () => {
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      setWishlistMessage('');
      await api.post(`/wishlist/${product._id}`);
      setWishlistMessage('Added to Wishlist');
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistMessage('Already in wishlist');
      } else {
        setWishlistMessage('Unable to save product. Please try again.');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // Using the shared cart context lets the same action work from the product card and product details page.
  const handleAddToCart = async () => {
    if (cartLoading) return;

    try {
      setCartLoading(true);
      setCartMessage('');
      await addToCart(product._id);
      setCartMessage('Added to cart');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to add product to cart.';
      setCartMessage(message);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />

      <div className="product-card-content">
        <h3>{product.name}</h3>
        <p className="product-meta">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
          {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
        </p>

        <div className="product-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </button>

          <button
            type="button"
            className="wishlist-button"
            onClick={handleAddToWishlist}
            disabled={wishlistLoading}
          >
            {wishlistLoading ? 'Saving...' : '♡ Add to Wishlist'}
          </button>

          <button
            type="button"
            className="primary-button small-button"
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        {wishlistMessage && <p className="inline-feedback wishlist-feedback">{wishlistMessage}</p>}
        {cartMessage && <p className="inline-feedback cart-feedback">{cartMessage}</p>}
      </div>
    </div>
  );
}

export default ProductCard;
