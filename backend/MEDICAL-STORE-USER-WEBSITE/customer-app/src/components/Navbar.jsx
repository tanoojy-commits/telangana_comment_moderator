import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SearchBar } from './SearchBar';
import { 
  ShoppingCart, Heart, User, LogOut, Menu, X, Sun, Moon, MapPin, ClipboardList, Settings, ShieldAlert
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout, isMockMode } = useAuth();
  const { cartItems, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('medstore_theme') === 'dark'
  );

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  // Apply dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('medstore_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('medstore_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistCount = wishlist.length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      
      {/* Dev Mode Banner (if Mocking) */}
      {isMockMode && (
        <div className="bg-primary-600 text-white text-[11px] font-medium text-center py-1 flex items-center justify-center gap-1.5 px-4">
          <ShieldAlert size={12} className="shrink-0" />
          <span>Currently in <strong>Mock Database Mode</strong>. Setup your Firebase keys in `.env` to connect live.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary-500/20">
              M
            </span>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent leading-none">
                MedStore
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                Pharmacy
              </span>
            </div>
          </Link>

          {/* Search Bar - Hidden on Mobile, Visible on Tablet+ */}
          <div className="hidden md:block flex-1 max-w-md lg:max-w-lg mx-4">
            <SearchBar />
          </div>

          {/* Action Links & Icons */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="My Wishlist"
            >
              <Heart size={20} />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalWishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown / Actions */}
            <div className="relative hidden md:block">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                      {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-700 animate-fade-in">
                      <div className="px-4 py-2.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <ClipboardList size={16} />
                          My Orders
                        </Link>
                        <Link
                          to="/addresses"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <MapPin size={16} />
                          Addresses
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors shadow-md shadow-primary-500/10"
                >
                  <User size={16} />
                  Login / Register
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </nav>
        </div>

        {/* Mobile Search - Visible under 768px */}
        <div className="md:hidden pb-4 px-1 flex justify-center">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          {/* Drawer Drawer Body */}
          <div 
            className="w-64 max-w-[85vw] h-full bg-white dark:bg-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-fade-in border-r border-slate-100 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* User Greeting */}
              {currentUser ? (
                <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-lg mb-3">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</p>
                </div>
              ) : (
                <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-700">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors"
                  >
                    <User size={16} />
                    Login / Register
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Browse Medicines
                </Link>
                {currentUser && (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <Settings size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <ClipboardList size={16} />
                      My Orders
                    </Link>
                    <Link
                      to="/addresses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <MapPin size={16} />
                      Addresses
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Logout block at drawer bottom */}
            {currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-8"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
