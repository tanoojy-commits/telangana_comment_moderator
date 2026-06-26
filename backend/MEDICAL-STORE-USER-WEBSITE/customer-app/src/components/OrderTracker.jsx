import React from 'react';
import { Check, Clipboard, Package, Truck, Compass, MapPinCheck, Clock } from 'lucide-react';

const STAGES = [
  { key: 'placed', label: 'Order Placed', icon: Clipboard },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out For Delivery', icon: Compass },
  { key: 'delivered', label: 'Delivered', icon: MapPinCheck }
];

export const OrderTracker = ({ currentStatus }) => {
  // Normalize currentStatus
  const normalizedStatus = currentStatus ? currentStatus.toLowerCase() : 'placed';
  const activeIndex = STAGES.findIndex(stage => stage.key === normalizedStatus);

  return (
    <div className="w-full py-6">
      
      {/* Horizontal Timeline - Hidden on small mobile screens */}
      <div className="hidden md:flex items-center justify-between w-full relative">
        
        {/* Connection Progress Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0 rounded-full">
          <div 
            className="h-full bg-primary-600 rounded-full transition-all duration-700" 
            style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {/* Timeline Items */}
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center z-10 flex-1 text-center">
              
              {/* Node Circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/10' 
                    : isActive 
                    ? 'bg-white dark:bg-slate-800 border-primary-600 text-primary-600 dark:text-primary-400 font-bold scale-110 ring-4 ring-primary-100 dark:ring-primary-950/40' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <Icon size={16} />
                )}
              </div>

              {/* Node Title */}
              <span 
                className={`mt-3 text-xs font-semibold leading-tight ${
                  isActive 
                    ? 'text-primary-700 dark:text-primary-400 font-bold' 
                    : isCompleted 
                    ? 'text-slate-800 dark:text-slate-200' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}

      </div>

      {/* Vertical Timeline - Shown on Mobile Screens */}
      <div className="flex flex-col md:hidden space-y-6 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
        
        {/* Active connection height indicator */}
        <div 
          className="absolute left-[11px] top-2 w-[2px] bg-primary-600 transition-all duration-700"
          style={{ height: `${(activeIndex / (STAGES.length - 1)) * 90}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex items-center gap-4 relative">
              
              {/* Stepper Circle */}
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 -ml-3.5 ${
                  isCompleted 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : isActive 
                    ? 'bg-white dark:bg-slate-850 border-primary-600 text-primary-600 ring-4 ring-primary-100 dark:ring-primary-950/20' 
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check size={10} className="stroke-[3]" />
                ) : (
                  <Icon size={10} />
                )}
              </div>

              {/* Details column */}
              <div className="flex items-center gap-2">
                <span 
                  className={`text-xs font-bold ${
                    isActive 
                      ? 'text-primary-700 dark:text-primary-400' 
                      : isCompleted 
                      ? 'text-slate-800 dark:text-slate-200 font-semibold' 
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : isActive ? '●' : '○'} {stage.label}
                </span>
                {isActive && (
                  <span className="text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 px-1.5 py-0.5 rounded animate-pulse">
                    Active
                  </span>
                )}
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default OrderTracker;
