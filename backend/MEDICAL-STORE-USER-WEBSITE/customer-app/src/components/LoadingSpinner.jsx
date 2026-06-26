import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    accent: 'border-accent-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-solid ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
};

export const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 animate-pulse">
      <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
      <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
      <div className="flex flex-col justify-between py-2">
        <div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-3"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-32"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-24"></div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
