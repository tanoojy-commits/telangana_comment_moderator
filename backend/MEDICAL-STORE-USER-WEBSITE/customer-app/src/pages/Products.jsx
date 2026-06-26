import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSpinner';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = [
  'Tablets', 'Capsules', 'Syrups', 'Injection', 'Diabetes Care',
  'Baby Care', 'Skin Care', 'Personal Care', 'Vitamins', 'Healthcare Devices'
];

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceMax, setPriceMax] = useState(2500);
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  
  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state with URL search params changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setPage(1); // reset to first page on search change
  }, [searchParams]);

  // Fetch products on filter changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const { products: fetchedProducts, totalPages: pages, totalCount: count } = 
          await productService.getProducts({
            category: selectedCategory === 'All' ? null : selectedCategory,
            searchQuery,
            priceRange: [0, priceMax],
            sortBy,
            page,
            limit: 8
          });
        setProducts(fetchedProducts);
        setTotalPages(pages);
        setTotalCount(count);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, priceMax, sortBy, page]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Update URL query
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceMax(2500);
    setSortBy('popularity');
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {selectedCategory === 'All' ? 'All Medicines' : selectedCategory}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Found {totalCount} items {searchQuery && `matching "${searchQuery}"`}
          </p>
        </div>

        {/* Sort & Mobile filter toggles */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex md:hidden items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* Sort Selection */}
          <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex-1 md:flex-initial">
            <ArrowUpDown size={14} className="text-slate-400 mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 w-full"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. Main Catalog Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR FILTERS - Hidden on Mobile */}
        <aside className="hidden md:block bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-8 sticky top-28">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Filters</h3>
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-semibold">
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Category
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
              <button
                onClick={() => handleCategorySelect('All')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Max Price
              </h4>
              <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
                ₹{priceMax}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="2500"
              step="10"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-primary-600 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>₹20</span>
              <span>₹2500</span>
            </div>
          </div>

        </aside>

        {/* PRODUCTS GRID CONTAINER */}
        <main className="md:col-span-3 space-y-8">
          
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white shadow shadow-primary-500/10'
                            : 'border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-12 text-center text-slate-400 space-y-4">
              <span className="text-4xl">💊</span>
              <h3 className="font-extrabold text-slate-700 dark:text-slate-200 text-base">No medicines found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">Try clearing your search query or selecting a different category from the sidebar filters.</p>
              <button 
                onClick={clearFilters}
                className="mt-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow"
              >
                Reset Filters
              </button>
            </div>
          )}

        </main>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setShowMobileFilters(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-800 rounded-t-3xl p-6 overflow-y-auto space-y-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-750 pb-3">
              <h3 className="font-bold text-slate-805 dark:text-white">Filters</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Categories</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategorySelect('All')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === 'All'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-350'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-650 dark:text-slate-350'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Max slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Max Price</span>
                <span className="text-primary-600 font-extrabold">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="20"
                max="2500"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  clearFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 font-bold text-xs hover:bg-red-50"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
