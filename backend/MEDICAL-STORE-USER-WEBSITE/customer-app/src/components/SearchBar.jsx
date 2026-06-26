import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';

export const SearchBar = ({ placeholder = "Search medicines, brands, categories..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Search logic on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const { products } = await productService.getProducts({
          searchQuery: query,
          limit: 5 // limit suggestions
        });
        setSuggestions(products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setQuery('');
    setShowDropdown(false);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all shadow-inner"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search size={18} />
        </div>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Predictive Dropdown Suggestions */}
      {showDropdown && (query.trim().length >= 2 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 animate-fade-in max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={18} />
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Matching Products
              </div>
              {suggestions.map((product) => (
                <button
                  key={product.productId}
                  type="button"
                  onClick={() => handleSuggestionClick(product.productId)}
                  className="w-full px-4 py-3 flex items-center text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-600"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {product.brand} • {product.category}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-500">
                      ₹{product.price}
                    </p>
                    {product.stock === 0 ? (
                      <span className="text-[10px] bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                        In Stock
                      </span>
                    )}
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full text-center py-2.5 text-xs font-semibold text-primary-600 dark:text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors block border-t border-slate-100 dark:border-slate-700"
              >
                View all search results
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              No medicines found matching "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
