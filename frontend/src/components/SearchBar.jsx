import { SearchIcon, CloseIcon } from './icons';

// Controlled search input with embedded icon and clear action
function SearchBar({ value, onChange, placeholder = 'Search catalog by name...' }) {
  return (
    <div className="search-bar-wrap">
      <SearchIcon className="search-bar-icon" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-bar-input"
        aria-label="Search catalog"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="search-bar-clear"
          aria-label="Clear search input"
          title="Clear search"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
