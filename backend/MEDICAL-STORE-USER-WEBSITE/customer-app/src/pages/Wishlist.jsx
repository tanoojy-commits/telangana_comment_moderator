import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist, moveToCart, toggleWishlist } = useCart();

  // 1. Empty Wishlist State
  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 page-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-105 dark:bg-slate-805 flex items-center justify-center mx-auto text-slate-400">
          <Heart size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-850 dark:text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
            Explore medicines, devices and health supplements to save your favorite items here.
          </p>
        </div>
        <Link 
          to="/products"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-750 text-white font-bold text-sm shadow transition-all hover:scale-105"
        >
          Browse medicines
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">My Wishlist</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
          Review your saved items and move them to cart for purchasing
        </p>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map(product => {
          const isOutOfStock = product.stock <= 0;
          return (
            <div 
              key={product.productId}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-200 transition-all relative overflow-hidden group"
            >
              
              {/* Delete Icon Button overlay */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3.5 right-3.5 z-10 p-2 bg-slate-50 hover:bg-red-50 dark:bg-slate-900/60 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                title="Remove from Wishlist"
              >
                <Trash2 size={14} />
              </button>

              <Link to={`/product/${product.productId}`}>
                {/* Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                <h3 className="text-sm font-bold text-slate-805 dark:text-white line-clamp-2 leading-tight mt-1 mb-2 h-10 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="space-y-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                  )}
                </div>

                {/* Move to Cart button */}
                <button
                  onClick={() => moveToCart(product)}
                  disabled={isOutOfStock}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
                    isOutOfStock
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }"
                >
                  <ShoppingCart size={13} />
                  Move to Cart
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Wishlist;
