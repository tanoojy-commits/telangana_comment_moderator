import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, Phone, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, Plus, Landmark } from 'lucide-react';

export const Checkout = () => {
  const { currentUser } = useAuth();
  const { cartItems, finalAmount, subtotal, deliveryCharges, couponDiscountAmount, couponCode, clearCart } = useCart();
  const navigate = useNavigate();

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // New Address Form toggle & state
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Checkout Placement State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Redirect if cart is empty and order is not placed yet
  useEffect(() => {
    if (cartItems.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [cartItems, navigate, placedOrder]);

  // Load User Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser) return;
      try {
        const addrList = await orderService.getAddressesByUser(currentUser.uid);
        setAddresses(addrList);
        // Pre-select default address if exists
        const defaultAddr = addrList.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId);
        } else if (addrList.length > 0) {
          setSelectedAddressId(addrList[0].addressId);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [currentUser]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');

    if (!name || !phone || !address || !city || !stateName || !pincode) {
      setAddressError('Please fill in all address fields.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setAddressError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setAddressError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setAddressLoading(true);
    try {
      const added = await orderService.addAddress(currentUser.uid, {
        name,
        phone,
        address,
        city,
        state: stateName,
        pincode,
        isDefault: addresses.length === 0 // Make default if it's the first address
      });

      setAddresses(prev => [...prev, added]);
      setSelectedAddressId(added.addressId);
      setShowNewAddressForm(false);
      // Reset form
      setName('');
      setPhone('');
      setAddress('');
      setCity('');
      setStateName('');
      setPincode('');
    } catch (err) {
      setAddressError('Could not save address. Try again.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }

    const finalAddress = addresses.find(a => a.addressId === selectedAddressId);
    if (!finalAddress) return;

    setPlacingOrder(true);
    try {
      const order = await orderService.placeOrder(
        currentUser.uid,
        cartItems,
        finalAmount,
        paymentMethod,
        finalAddress
      );
      
      setPlacedOrder(order);
      clearCart(); // Clear shopping cart on success
    } catch (err) {
      console.error('Place order failed:', err);
      alert('Error placing order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // --- 1. SUCCESS CONFIRMATION PANEL ---
  if (placedOrder) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-6 page-fade-in">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 size={48} className="stroke-[2.5]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Order Placed Successfully!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thank you for shopping. Your medicines will be packed and shipped shortly.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl space-y-2.5 text-xs text-left max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
            <span className="font-extrabold text-slate-800 dark:text-white select-all">{placedOrder.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Amount Paid</span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400">₹{placedOrder.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Method</span>
            <span className="font-bold text-slate-700 dark:text-slate-350">{placedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Deliver To</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{placedOrder.shippingAddress.name}</span>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Link
            to={`/order/${placedOrder.orderId}`}
            className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow transition-all hover:scale-105"
          >
            Track Order Status
          </Link>
          <Link
            to="/products"
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8">Checkout Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: SHIPPING ADDRESS & PAYMENT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section A: Shipping Address selection */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                <MapPin size={20} className="text-primary-600" />
                Delivery Address
              </h3>
              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <LoadingSpinner size="sm" />
            ) : showNewAddressForm ? (
              
              /* Inline New Address form */
              <form onSubmit={handleAddAddress} className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  New Delivery Address Details
                </h4>

                {addressError && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs p-2.5 rounded-xl border border-red-200">
                    {addressError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Recipient's Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="10-Digit Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Street Address, Building, flat no."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode (6 digits)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(false);
                      setAddressError('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-750 dark:text-slate-250 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all"
                  >
                    {addressLoading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>

            ) : addresses.length > 0 ? (
              
              /* Address List selector */
              <div className="space-y-3.5">
                {addresses.map(addr => (
                  <label
                    key={addr.addressId}
                    className={`flex items-start p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedAddressId === addr.addressId
                        ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/10'
                        : 'border-slate-150 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-750/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_address"
                      checked={selectedAddressId === addr.addressId}
                      onChange={() => setSelectedAddressId(addr.addressId)}
                      className="mt-1 w-4 h-4 text-primary-605 border-slate-300 focus:ring-primary-500"
                    />
                    
                    <div className="ml-3.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-450 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-350 mt-1">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      <div className="flex items-center gap-1 text-slate-400 mt-2">
                        <Phone size={12} />
                        <span>{addr.phone}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No delivery addresses found. Add a shipping address below to complete purchase.
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="mt-3 block bg-primary-600 text-white font-bold px-4 py-2 rounded-xl mx-auto"
                >
                  Create Shipping Address
                </button>
              </div>
            )}

          </div>

          {/* Section B: Payment Methods selection */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <CreditCard size={20} className="text-primary-600" />
              Payment Methods
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* UPI */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/10'
                    : 'border-slate-150 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750/30'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 text-xs">
                    <p className="font-bold text-slate-800 dark:text-white">UPI / Instant Pay</p>
                    <p className="text-slate-400">GPay, PhonePe, Paytm</p>
                  </div>
                </div>
                <Landmark size={20} className="text-slate-400 shrink-0" />
              </label>

              {/* Card */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/10'
                    : 'border-slate-150 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750/30'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 text-xs">
                    <p className="font-bold text-slate-800 dark:text-white">Credit / Debit Card</p>
                    <p className="text-slate-400">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
                <CreditCard size={20} className="text-slate-400 shrink-0" />
              </label>

              {/* COD */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/10'
                    : 'border-slate-150 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750/30'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 text-xs">
                    <p className="font-bold text-slate-800 dark:text-white">Cash on Delivery</p>
                    <p className="text-slate-400">Pay cash/UPI at delivery</p>
                  </div>
                </div>
                <span className="text-slate-400 font-extrabold text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">COD</span>
              </label>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: SUMMARY & CONFIRMATION CHECKOUT */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">
            Order Review Summary
          </h3>

          {/* Items breakdown list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.productId} className="flex justify-between items-center text-xs gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                  <p className="text-slate-400 text-[10px]">Qty: {item.quantity} • ₹{item.price}/unit</p>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Cost layout */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">₹{subtotal}</span>
            </div>
            
            {couponDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Coupon saving ({couponCode})</span>
                <span>- ₹{couponDiscountAmount}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              {deliveryCharges === 0 ? (
                <span className="text-emerald-505 font-bold text-emerald-500">FREE</span>
              ) : (
                <span>₹{deliveryCharges}</span>
              )}
            </div>

            <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-3 text-sm font-black text-slate-900 dark:text-white">
              <span>Payable Total</span>
              <span className="text-primary-600 dark:text-primary-400 text-base">₹{finalAmount}</span>
            </div>
          </div>

          {/* Security trust badge */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-[10px] text-slate-400">
            <ShieldCheck size={18} className="text-primary-650 shrink-0 text-primary-500" />
            <p>Your transactions are encrypted and processed by our secure systems. 100% guarantee on orders.</p>
          </div>

          {/* Place order CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || !selectedAddressId}
            className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all hover:scale-[1.01] shadow-lg shadow-primary-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {placingOrder ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Processing Secure Order...
              </>
            ) : (
              <>
                Confirm & Place Order (₹{finalAmount})
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
