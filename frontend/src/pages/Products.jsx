import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import api, { getProducts } from '../services/api';
import { Spinner, RefreshIcon } from '../components/icons';

const categoryOptions = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home',
  'Sports',
  'Beauty',
];

const sortOptions = [
  { value: 'default', label: 'Default Sorting' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A to Z' },
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All Categories';
  const sortParam = searchParams.get('sort') || 'default';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== 'All Categories') params.category = category;

        const response = await getProducts(params);
        if (!isCancelled) {
          setProducts(response.data.products || []);
          setError('');
        }
      } catch {
        if (!isCancelled) {
          setError('Unable to load products. Please check your connection.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        await api.get('/customers/me');
      } catch {
        navigate('/login');
      }
    };
    checkCustomer();
  }, [navigate]);

  const handleCategoryChange = (newCat) => {
    const newParams = new URLSearchParams(searchParams);
    if (newCat === 'All Categories') {
      newParams.delete('category');
    } else {
      newParams.set('category', newCat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (newQuery) => {
    const newParams = new URLSearchParams(searchParams);
    if (!newQuery.trim()) {
      newParams.delete('search');
    } else {
      newParams.set('search', newQuery);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort === 'default') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', newSort);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortParam === 'price-low') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortParam === 'price-high') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortParam === 'name-az') {
      list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }
    return list;
  }, [products, sortParam]);

  const hasActiveFilters = search.trim() !== '' || category !== 'All Categories' || sortParam !== 'default';

  return (
    <div className="products-page-container">
      <Navbar />

      <main className="products-page">
        <header className="products-header">
          <span className="eyebrow">Catalog</span>
          <h1>All Products</h1>

          <div className="filter-row">
            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search by product name..." />

            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
              aria-label="Filter by category"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
              aria-label="Sort products"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="secondary-button small-button reset-filter-btn"
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <RefreshIcon size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="catalog-meta-bar" style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="catalog-count-text" style={{ color: 'var(--muted-text)', fontSize: '0.9rem', fontWeight: 500 }}>
              {loading
                ? 'Loading products...'
                : `${sortedProducts.length} product${sortedProducts.length === 1 ? '' : 's'} available`}
              {category !== 'All Categories' && ` in ${category}`}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="products-loading-center" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spinner size={32} />
            <p className="status-text" style={{ marginTop: '12px' }}>Loading catalog products...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={handleResetFilters}
              style={{ marginTop: '16px' }}
            >
              Reload Products
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>
              {search
                ? `No products matching "${search}" were found in ${category}.`
                : 'No products are currently available in this category.'}
            </p>
            <button
              type="button"
              className="primary-button inline-button"
              onClick={handleResetFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Products;
