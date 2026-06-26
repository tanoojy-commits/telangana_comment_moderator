import React from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleDecrease = () => {
    updateQuantity(item.productId, item.quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  const itemSubtotal = item.price * item.quantity;
  const isOutOfStock = item.stock <= 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl gap-4 shadow-sm hover:shadow-md transition-shadow">
      
      {/* 1. Image & Basic Details Link */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Link to={`/product/${item.productId}`} className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="min-w-0">
          <Link to={`/product/${item.productId}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[280px]">
              {item.name}
            </h4>
          </Link>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
            {item.category}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-black text-slate-950 dark:text-white">
              ₹{item.price}
            </span>
            {item.mrp > item.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{item.mrp}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-700">
        
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full bg-slate-50 dark:bg-slate-900 px-1.5 py-1">
          <button
            onClick={handleDecrease}
            className="p-1 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Decrease quantity"
            disabled={item.quantity <= 1}
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-100">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={item.quantity >= item.stock}
            className={`p-1 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors ${
              item.quantity >= item.stock ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Total Price and Remove Actions */}
        <div className="flex items-center gap-4 text-right">
          <div className="min-w-[80px]">
            <p className="text-xs text-slate-400 dark:text-slate-500">Subtotal</p>
            <p className="text-sm font-black text-primary-600 dark:text-primary-500">
              ₹{itemSubtotal}
            </p>
          </div>

          <button
            onClick={() => removeFromCart(item.productId)}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default CartItem;
