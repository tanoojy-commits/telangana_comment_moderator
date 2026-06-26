import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { isFirebaseConfigured, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  // Custom toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    // Reset toast after 2.5 seconds
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // 1. Fetch Cart and Wishlist when currentUser changes
  useEffect(() => {
    const fetchCartAndWishlist = async () => {
      if (!currentUser) {
        // Load guest cart/wishlist from localStorage
        const localCart = localStorage.getItem('medstore_guest_cart');
        const localWish = localStorage.getItem('medstore_guest_wishlist');
        setCartItems(localCart ? JSON.parse(localCart) : []);
        setWishlist(localWish ? JSON.parse(localWish) : []);
        return;
      }

      if (isFirebaseConfigured) {
        try {
          // Fetch from Firestore
          const cartRef = doc(db, 'cart', currentUser.uid);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            setCartItems(cartSnap.data().items || []);
          } else {
            setCartItems([]);
          }

          const wishRef = doc(db, 'wishlist', currentUser.uid);
          const wishSnap = await getDoc(wishRef);
          if (wishSnap.exists()) {
            setWishlist(wishSnap.data().products || []);
          } else {
            setWishlist([]);
          }
        } catch (e) {
          console.error('Error reading cart/wishlist from Firestore, falling back to local.', e);
          loadLocalUserStorage(currentUser.uid);
        }
      } else {
        loadLocalUserStorage(currentUser.uid);
      }
    };

    fetchCartAndWishlist();
  }, [currentUser]);

  // Load from local storage for a specific user ID
  const loadLocalUserStorage = (uid) => {
    const userCart = localStorage.getItem(`medstore_cart_${uid}`);
    const userWish = localStorage.getItem(`medstore_wish_${uid}`);
    setCartItems(userCart ? JSON.parse(userCart) : []);
    setWishlist(userWish ? JSON.parse(userWish) : []);
  };

  // 2. Persist Cart & Wishlist to Firestore or Local Storage whenever they change
  useEffect(() => {
    const syncCartAndWishlist = async () => {
      if (!currentUser) {
        localStorage.setItem('medstore_guest_cart', JSON.stringify(cartItems));
        localStorage.setItem('medstore_guest_wishlist', JSON.stringify(wishlist));
        return;
      }

      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db, 'cart', currentUser.uid), { userId: currentUser.uid, items: cartItems });
          await setDoc(doc(db, 'wishlist', currentUser.uid), { userId: currentUser.uid, products: wishlist });
        } catch (err) {
          console.error('Error writing cart/wishlist to Firestore:', err);
          saveLocalUserStorage(currentUser.uid, cartItems, wishlist);
        }
      } else {
        saveLocalUserStorage(currentUser.uid, cartItems, wishlist);
      }
    };

    // Use a slight debounce if necessary, but direct sync is fine for client operations
    syncCartAndWishlist();
  }, [cartItems, wishlist, currentUser]);

  const saveLocalUserStorage = (uid, cart, wish) => {
    localStorage.setItem(`medstore_cart_${uid}`, JSON.stringify(cart));
    localStorage.setItem(`medstore_wish_${uid}`, JSON.stringify(wish));
  };

  // --- CART ACTIONS ---
  const addToCart = (product, quantity = 1) => {
    showToast(`Added "${product.name}" to cart.`, 'success');
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.productId === product.productId);
      if (existing) {
        // Enforce stock limits
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prevItems.map(item => 
          item.productId === product.productId 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      return [...prevItems, { 
        productId: product.productId, 
        name: product.name, 
        price: product.price, 
        mrp: product.mrp, 
        image: product.image,
        category: product.category,
        stock: product.stock,
        quantity: Math.min(quantity, product.stock)
      }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity: Math.min(quantity, item.stock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cartItems.find(item => item.productId === productId);
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.name}" from cart.`, 'info');
    }
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setCouponDiscountPercent(0);
    setCouponSuccess('');
  };

  // --- WISHLIST ACTIONS ---
  const toggleWishlist = (product) => {
    setWishlist(prevWish => {
      const exists = prevWish.some(item => item.productId === product.productId);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist.`, 'info');
        return prevWish.filter(item => item.productId !== product.productId);
      }
      showToast(`Added "${product.name}" to wishlist!`, 'success');
      return [...prevWish, {
        productId: product.productId,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        category: product.category,
        stock: product.stock
      }];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.productId === productId);
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    setWishlist(prev => prev.filter(item => item.productId !== product.productId));
  };

  // --- COUPON & FINANCIAL CALCULATIONS ---
  const applyCoupon = (code) => {
    setCouponError('');
    setCouponSuccess('');
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode === 'HEALTH10') {
      setCouponCode(normalizedCode);
      setCouponDiscountPercent(10);
      setCouponSuccess('Coupon "HEALTH10" applied! You saved 10% on your items.');
      showToast('Coupon applied successfully!', 'success');
      return true;
    } else {
      setCouponError('Invalid coupon code. Try "HEALTH10"');
      setCouponDiscountPercent(0);
      showToast('Invalid coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercent(0);
    setCouponSuccess('');
    setCouponError('');
    showToast('Coupon removed.', 'info');
  };

  // Calculate pricing breakdown
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalMrp = cartItems.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
  const catalogDiscount = totalMrp - subtotal;
  
  const couponDiscountAmount = Math.round(subtotal * (couponDiscountPercent / 100));
  
  // Free delivery for orders above $500, otherwise $40
  const deliveryCharges = subtotal > 500 || subtotal === 0 ? 0 : 40;
  
  const finalAmount = subtotal - couponDiscountAmount + deliveryCharges;

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlist,
      couponCode,
      couponDiscountPercent,
      couponError,
      couponSuccess,
      subtotal,
      totalMrp,
      catalogDiscount,
      couponDiscountAmount,
      deliveryCharges,
      finalAmount,
      toast,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      moveToCart,
      applyCoupon,
      removeCoupon,
      showToast
    }}>
      {children}
    </CartContext.Provider>
  );
};
export default CartContext;
