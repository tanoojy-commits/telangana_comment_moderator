import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, Sparkles, Activity, ShieldPlus, Syringe, Heart, Flower2, Baby, Apple, HeartPulse 
} from 'lucide-react';

const CATEGORY_MAP = {
  'Tablets': {
    icon: Pill,
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20'
  },
  'Capsules': {
    icon: Pill,
    gradient: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50 dark:bg-teal-950/20'
  },
  'Syrups': {
    icon: Activity,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-950/20'
  },
  'Injection': {
    icon: Syringe,
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50 dark:bg-rose-950/20'
  },
  'Diabetes Care': {
    icon: HeartPulse,
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50 dark:bg-sky-950/20'
  },
  'Baby Care': {
    icon: Baby,
    gradient: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/20'
  },
  'Skin Care': {
    icon: Flower2,
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50 dark:bg-purple-950/20'
  },
  'Personal Care': {
    icon: Sparkles,
    gradient: 'from-cyan-500 to-teal-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20'
  },
  'Vitamins': {
    icon: Apple,
    gradient: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20'
  },
  'Healthcare Devices': {
    icon: ShieldPlus,
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20'
  }
};

export const CategoryCard = ({ category }) => {
  const mapping = CATEGORY_MAP[category] || {
    icon: Activity,
    gradient: 'from-primary-500 to-green-600',
    bg: 'bg-emerald-50'
  };

  const IconComponent = mapping.icon;

  return (
    <Link 
      to={`/products?category=${encodeURIComponent(category)}`}
      className="group flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900/30 transition-all duration-300 transform hover:-translate-y-1 text-center"
    >
      {/* Icon Capsule */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr ${mapping.gradient} text-white shadow-md shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
        <IconComponent size={24} />
      </div>
      
      {/* Title */}
      <span className="mt-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {category}
      </span>
    </Link>
  );
};

export default CategoryCard;
