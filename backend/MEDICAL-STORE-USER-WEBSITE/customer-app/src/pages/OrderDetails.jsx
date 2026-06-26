import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { OrderTracker } from '../components/OrderTracker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChevronLeft, Calendar, Landmark, MapPin, Repeat, ShoppingCart } from 'lucide-react';

export const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Data States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId, navigate]);

  const handleReorder = () => {
    if (!order) return;
    // Add all order items back to cart
    order.items.forEach(item => {
      addToCart(item, item.quantity);
    });
    navigate('/cart');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 page-fade-in">
      
      {/* Back & Reorder Header buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <Link to="/orders" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-905 dark:hover:text-white transition-colors">
            <ChevronLeft size={16} />
            Back to Orders
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">
            Order #{order.orderId.toUpperCase()}
          </h2>
        </div>
        
        <button
          onClick={handleReorder}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md shadow-primary-500/10 self-start sm:self-auto"
        >
          <Repeat size={14} />
          Reorder All Items
        </button>
      </div>

      {/* TRACKING VISUAL TIMELINE */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="font-extrabold text-slate-850 dark:text-white text-sm mb-4 border-b border-slate-50 dark:border-slate-700/50 pb-2">
          Delivery Status Tracking
        </h3>
        <OrderTracker currentStatus={order.status} />
      </div>

      {/* DETAILED LAYOUT: ITEMS & BILLING ADDRESSES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* ITEMS RECEIPT - 2 Columns */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm border-b border-slate-100 dark:border-slate-700 pb-3">
            Item Receipt
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-750">
            {order.items.map(item => (
              <div key={item.productId} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-850 dark:text-white truncate">{item.name}</p>
                    <p className="text-slate-400 text-[10px]">Qty: {item.quantity} • ₹{item.price}/unit</p>
                  </div>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between items-baseline text-xs text-slate-400">
            <span>Total Payable Amount</span>
            <span className="text-lg font-black text-primary-600 dark:text-primary-500">₹{order.amount}</span>
          </div>
        </div>

        {/* METADATA: SHIPPING & BILLING ADDRESS - 1 Column */}
        <div className="space-y-6">
          
          {/* Shipping Address */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-805 dark:text-white text-sm border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary-650 text-primary-500" />
              Delivery Shipping Address
            </h3>
            
            <div className="text-xs text-slate-600 dark:text-slate-350 space-y-1">
              <p className="font-extrabold text-slate-800 dark:text-white">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-slate-400 pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment & Date Metadata */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-450">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Ordered On</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-450">
                <Landmark size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Payment Method</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{order.paymentMethod} Payment</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderDetails;
