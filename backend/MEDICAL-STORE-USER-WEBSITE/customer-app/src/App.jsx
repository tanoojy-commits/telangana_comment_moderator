import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import NotFound from './pages/NotFound';

// Import Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Subcomponent to consume Cart Context and show global Toast notifications
const AppLayout = ({ children }) => {
  const { toast } = useCart();

  const toastBgColor = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    info: 'bg-slate-800 text-white shadow-slate-900/20',
    error: 'bg-red-650 text-white shadow-red-500/20 bg-red-600'
  };

  return (
    <div className="flex flex-col min-h-screen bg-slateCustom-50 dark:bg-slate-900 text-slateCustom-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      
      {/* Main Pages viewport */}
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />

      {/* Dynamic Toast Popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in ${toastBgColor[toast.type] || 'bg-slate-800'}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Protected Routes */}
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/order/:orderId" element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/addresses" element={
                <ProtectedRoute>
                  <Addresses />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
