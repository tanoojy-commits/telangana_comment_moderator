import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, ShieldAlert, Heart, Mail, Phone, MapPin, Send } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 transition-colors duration-300">
      
      {/* 1. Value Proposition Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl text-primary-500">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Medicines</h4>
              <p className="text-xs text-slate-500 mt-1">Sourced directly from verified manufacturers and trusted distributors.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl text-accent-500">
              <Truck size={28} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Fast Home Delivery</h4>
              <p className="text-xs text-slate-500 mt-1">Free delivery on orders above ₹500. Same day shipping in major cities.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl text-emerald-500">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Secure Transactions</h4>
              <p className="text-xs text-slate-500 mt-1">256-bit SSL encrypted gateway. Multiple payment options supported.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-base">
                M
              </span>
              <h3 className="text-white font-bold text-base leading-none">MedStore Pharmacy</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Your trusted online pharmacy partner, delivering authentic medicines, wellness products, and healthcare devices to your doorstep.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-primary-500" />
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-primary-500" />
                <span>support@medstore.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary-500" />
                <span>102 Pharmacy Drive, Suite A</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=Tablets" className="hover:text-primary-500 transition-colors">Tablets</Link></li>
              <li><Link to="/products?category=Capsules" className="hover:text-primary-500 transition-colors">Capsules</Link></li>
              <li><Link to="/products?category=Syrups" className="hover:text-primary-500 transition-colors">Syrups</Link></li>
              <li><Link to="/products?category=Vitamins" className="hover:text-primary-500 transition-colors">Vitamins</Link></li>
              <li><Link to="/products?category=Healthcare%20Devices" className="hover:text-primary-500 transition-colors">Healthcare Devices</Link></li>
            </ul>
          </div>

          {/* Policies/Help */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-primary-500 transition-colors">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-primary-500 transition-colors">My Profile</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary-500 transition-colors">My Wishlist</Link></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Stay Healthy</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Subscribe to get health tips, discount coupons, and pharmacy reminders.
            </p>
            {subscribed ? (
              <div className="bg-primary-950/30 border border-primary-900/30 text-primary-400 p-3.5 rounded-xl text-xs font-medium">
                Thank you! You are subscribed with 10% discount coupon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 p-1 transition-colors"
                  aria-label="Submit Email"
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* 3. Credits & Copyright */}
      <div className="bg-slate-950/60 py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MedStore Pharmacy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 animate-pulse" /> for health and wellness.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
