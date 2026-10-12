import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api, { getProductById } from '../services/api';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        await api.get('/customers/me');
      } catch (err) {
        navigate('/login');
        return;
      }

      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError('');

          const response = await getProductById(id);
          setProduct(response.data.product);
        } catch (err) {
          if (err.response?.status === 404) {
            setProduct(null);
            setError('');
            return;
          }

          setError('Something went wrong while loading the product.');
        } finally {
          setLoading(false);
        }
      };

      if (id) {
        fetchProduct();
      }
    };

    verifyAccess();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      setCartMessage('');
      await addToCart(product._id);
      setCartMessage('Added to cart');
    } catch (err) {
      setCartMessage(err.response?.data?.message || 'Unable to add product to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product || wishlistLoading) return;

    try {
      setWishlistLoading(true);
      setWishlistMessage('');
      await api.post(`/wishlist/${product._id}`);
      setWishlistMessage('Added to Wishlist');
    } catch (err) {
      setWishlistMessage(err.response?.data?.message || 'Unable to save product. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="product-details-page-container">
      <Navbar />

      {loading ? (
        <p className="status-text">Loading product...</p>
      ) : error ? (
        <p className="status-text error-message">{error}</p>
      ) : !product ? (
        <p className="status-text">Product not found.</p>
      ) : (
        <div className="product-details-page">
          <div className="product-details-card">
            <img src={product.image} alt={product.name} className="product-details-image" />

            <div className="product-details-info">
              <h1>{product.name}</h1>
              <p className="product-description">{product.description}</p>
              <p className="product-price">₹{product.price}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Stock:</strong> {product.stock}</p>

              <div className="details-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  type="button"
                  className="wishlist-button details-wishlist-button"
                  onClick={handleAddToWishlist}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? 'Saving...' : '♡ Add to Wishlist'}
                </button>
              </div>

              {cartMessage && <p className="inline-feedback cart-feedback">{cartMessage}</p>}
              {wishlistMessage && <p className="inline-feedback wishlist-feedback">{wishlistMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
