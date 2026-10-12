// Simple controlled input used by the products page for filtering the catalog.
function SearchBar({ value, onChange, placeholder = 'Search products...' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="search-input"
    />
  );
}

export default SearchBar;
