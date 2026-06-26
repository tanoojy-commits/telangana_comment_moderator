import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/CartItem';
import { ShoppingBag, ArrowRight, Tag, X, Trash2, ShieldAlert } from 'lucide-react';

export const Cart = () => {
  const { 
    cartItems, subtotal, totalMrp, catalogDiscount, couponDiscountAmount, 
    deliveryCharges, finalAmount, couponCode, couponError, couponSuccess, 
    applyCoupon, removeCoupon, clearCart 
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const success = applyCoupon(couponInput);
      if (success) setCouponInput('');
    }
  };

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  // 1. Empty Cart Layout
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 page-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-105 dark:bg-slate-805 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
            Browse our pharmacy and add medicines, vitamins, and healthcare devices to get started.
          </p>
        </div>
        <Link 
          to="/products"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-750 text-white font-bold text-sm shadow-lg shadow-primary-500/10 transition-all hover:scale-105"
        >
          Browse Medicines
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      <h2 className="text-2xl font-black text-slate-805 dark:text-white mb-8">Shopping Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: ITEMS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
              Items in Cart ({cartItems.length})
            </span>
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 size={14} />
              Clear Cart
            </button>
          </div>

          <div className="space-y-3">
            {cartItems.map(item => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PRICE SUMMARY & COUPONS */}
        <div className="space-y-6">
          
          {/* Coupon Box */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Tag size={16} className="text-primary-600" />
              Apply Coupon
            </h3>
            
            {couponCode ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>Active: <strong>{couponCode}</strong> ({couponDiscountPercent}% Off)</span>
                <button onClick={removeCoupon} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded transition-colors text-emerald-850 dark:text-emerald-300">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. HEALTH10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 shadow"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-red-500 text-[10px] font-bold">{couponError}</p>}
            {couponSuccess && <p className="text-emerald-500 text-[10px] font-bold">{couponSuccess}</p>}
            
            {!couponCode && (
              <p className="text-[10px] text-slate-400 font-semibold">
                Tip: Try using <strong className="text-primary-600 font-extrabold cursor-pointer hover:underline" onClick={() => applyCoupon('HEALTH10')}>HEALTH10</strong> at checkout for 10% savings.
              </p>
            )}
          </div>

          {/* Pricing Billing Summary Box */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm border-b border-slate-100 dark:border-slate-700 pb-3">
              Order Billing Summary
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-550 dark:text-slate-450">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹{totalMrp}</span>
              </div>
              
              {catalogDiscount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Product Catalog Discount</span>
                  <span>- ₹{catalogDiscount}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-white font-bold">₹{subtotal}</span>
              </div>

              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Coupon discount ({couponDiscountPercent}%)</span>
                  <span>- ₹{couponDiscountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                {deliveryCharges === 0 ? (
                  <span className="text-emerald-500 font-bold">FREE</span>
                ) : (
                  <span>₹{deliveryCharges}</span>
                )}
              </div>
              
              {deliveryCharges > 0 && (
                <p className="text-[10px] text-slate-400 text-right">
                  Add ₹{500 - subtotal} more for free delivery
                </p>
              )}
            </div>

            {/* Total Billing row */}
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-3 text-sm font-black text-slate-900 dark:text-white">
              <span>Final Payable Amount</span>
              <span className="text-primary-600 dark:text-primary-500 text-base">₹{finalAmount}</span>
            </div>

            {/* Guarantee disclaimer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex items-start gap-2 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              <ShieldAlert size={16} className="text-primary-600 shrink-0 mt-0.5" />
              <p>Items in your cart are subject to real-time stocks. Checkout now to confirm your order.</p>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-750 text-white font-bold text-sm transition-all hover:scale-[1.01] shadow-lg shadow-primary-500/10"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
