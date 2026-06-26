import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Eye } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.productId);
  const isOutOfStock = product.stock <= 0;

  // Calculate discount percentage
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-900/20 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Wishlist Button Overlay */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 ${
          wishlisted
            ? 'bg-red-500 text-white scale-110'
            : 'bg-white/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-red-500'
        }`}
        aria-label="Add to Wishlist"
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Discount Badge Overlay */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-red-500 text-white rounded-md shadow-sm">
          {discount}% OFF
        </span>
      )}

      {/* Link Wrap around image & basic details */}
      <Link to={`/product/${product.productId}`} className="block flex-1 p-4">
        {/* Product Image Box */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
            {product.brand}
          </span>
          <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Stock status indicator */}
        <div className="mb-3">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              ● Out of Stock
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              ● In Stock ({product.stock} units)
            </span>
          )}
        </div>
      </Link>

      {/* Pricing & Footer Actions */}
      <div className="p-4 pt-0 border-t border-slate-50 dark:border-slate-700/50">
        
        {/* Pricing Layout */}
        <div className="flex items-baseline justify-between mb-4 mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/product/${product.productId}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
            title="View Details"
          >
            <Eye size={14} />
            Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/5 ${
              isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg'
            }`}
          >
            <ShoppingCart size={14} />
            Buy
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
