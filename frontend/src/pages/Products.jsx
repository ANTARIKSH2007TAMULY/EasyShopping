import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import api, { getProducts } from '../services/api';

const categoryOptions = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (search.trim()) {
          params.search = search.trim();
        }
        if (category !== 'All Categories') {
          params.category = category;
        }
        const response = await getProducts(params);
        setProducts(response.data.products || []);
      } catch (err) {
        setError('Something went wrong while loading products.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);
    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        await api.get('/customers/me');
      } catch (err) {
        navigate('/login');
      }
    };
    checkCustomer();
  }, [navigate]);

  return (
    <div className="products-page-container">
      <Navbar />
      <div className="products-page">
        <div className="products-header">
          <h1>Products</h1>
          <div className="filter-row">
            <SearchBar value={search} onChange={setSearch} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <p className="status-text">Loading products...</p>
        ) : error ? (
          <p className="status-text error-message">{error}</p>
        ) : products.length === 0 ? (
          <p className="status-text">No products found.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
