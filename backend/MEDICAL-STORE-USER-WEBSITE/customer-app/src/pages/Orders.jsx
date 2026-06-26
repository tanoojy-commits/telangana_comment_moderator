import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShoppingBag, ArrowRight, Calendar, Landmark, ClipboardCheck } from 'lucide-react';

const STATUS_BADGES = {
  placed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
  processing: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
  packed: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
  shipped: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
  out_for_delivery: 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400',
  delivered: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
};

export const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser) return;
      try {
        const list = await orderService.getOrdersByUser(currentUser.uid);
        setOrders(list);
      } catch (err) {
        console.error('Error loading orders list:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentUser]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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

  // 1. Empty State
  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 page-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-105 dark:bg-slate-805 flex items-center justify-center mx-auto text-slate-450 dark:text-slate-500">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">No Orders Yet</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
            You haven't placed any medical orders yet. Browse our inventory to add medicines.
          </p>
        </div>
        <Link 
          to="/products"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-750 text-white font-bold text-sm shadow transition-all hover:scale-105"
        >
          Browse Medicines
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-805 dark:text-white">My Orders</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Review your purchase histories and tracking stages</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div 
            key={order.orderId}
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          >
            {/* Meta details column */}
            <div className="space-y-3.5 flex-1 min-w-0">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                  ID: #{order.orderId.toUpperCase()}
                </span>
                
                <span className={`text-[10px] uppercase font-bold tracking-wide px-2.5 py-0.5 rounded-full ${STATUS_BADGES[order.status] || 'bg-slate-100'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items Summary line */}
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                {order.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}
              </p>

              {/* Timing & Payment */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Landmark size={13} />
                  <span>{order.paymentMethod}</span>
                </div>
              </div>

            </div>

            {/* Price and CTA actions column */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-700 shrink-0 gap-3">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Amount</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">₹{order.amount}</p>
              </div>

              <Link
                to={`/order/${order.orderId}`}
                className="flex items-center justify-center gap-1 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold transition-all hover:scale-102"
              >
                <ClipboardCheck size={14} />
                Details
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Orders;
