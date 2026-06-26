import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center page-fade-in">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xl">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={36} className="stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-850 dark:text-white">Page Not Found</h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-750 text-white font-bold text-xs shadow-md shadow-primary-500/10 transition-all hover:scale-105"
        >
          <Home size={14} />
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
