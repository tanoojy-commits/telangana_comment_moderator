import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, Award, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

const CATEGORIES = [
  'Tablets', 'Capsules', 'Syrups', 'Injection', 'Diabetes Care',
  'Baby Care', 'Skin Care', 'Personal Care', 'Vitamins', 'Healthcare Devices'
];

const HERO_SLIDES = [
  {
    title: 'Genuine Medicines, Delivered Safely',
    description: 'Get your prescription and over-the-counter medicines delivered to your home. Save up to 15% today.',
    bgColor: 'from-emerald-600 via-primary-600 to-green-500',
    badge: 'Express Shipping',
    ctaText: 'Shop Medicines',
    link: '/products',
    promoCode: 'HEALTH10'
  },
  {
    title: 'Immunity & Vitamins Super Sale',
    description: 'Boost your family health. Grab multivitamin tablets, calcium, and baby care essentials with flat discounts.',
    bgColor: 'from-sky-600 to-indigo-600',
    badge: 'Flat 10% Off',
    ctaText: 'Browse Health Pack',
    link: '/products?category=Vitamins',
    promoCode: 'HEALTH10'
  },
  {
    title: 'Track Health At Home',
    description: 'Monitor blood pressure, pulse, and oxygen saturation with modern medical devices from top brands.',
    bgColor: 'from-purple-650 via-pink-600 to-rose-500',
    badge: '100% Genuine Devices',
    ctaText: 'Explore Devices',
    link: '/products?category=Healthcare%20Devices',
    promoCode: 'HEALTH10'
  }
];

export const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sectionsData, setSectionsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await productService.getFeaturedSections();
        setSectionsData(data);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <div className="space-y-12 pb-16 page-fade-in">
      
      {/* 1. Hero Promotional Slider */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 bg-slate-900 mt-4">
        
        {/* Banners Slide Container */}
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${HERO_SLIDES.length * 100}%` }}
        >
          {HERO_SLIDES.map((slide, index) => (
            <div 
              key={index}
              className={`w-full bg-gradient-to-r ${slide.bgColor} text-white px-8 py-14 sm:py-20 md:py-24 flex flex-col justify-center relative min-h-[340px]`}
              style={{ width: '100%' }}
            >
              {/* Backglow decor */}
              <div className="absolute right-10 bottom-0 top-0 w-1/3 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="max-w-2xl space-y-4 sm:space-y-6 relative z-10">
                <span className="inline-block px-3 py-1 bg-white/25 rounded-full text-xs font-bold uppercase tracking-wider">
                  {slide.badge}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-emerald-50 max-w-xl font-medium leading-relaxed">
                  {slide.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link 
                    to={slide.link} 
                    className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-black/15"
                  >
                    {slide.ctaText}
                  </Link>
                  {slide.promoCode && (
                    <div className="border border-white/40 bg-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                      <span className="text-xs text-white/80 font-bold uppercase">Use Code:</span>
                      <span className="text-sm text-yellow-300 font-extrabold tracking-wide uppercase">{slide.promoCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sliders Arrow Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all z-20"
          aria-label="Next Slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Carousel Indicators dots */}
        <div className="absolute bottom-4 left-1/2 -translate-y-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/40'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </section>

      {/* 2. Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">Browse medicines by their medical classification</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {CATEGORIES.map(category => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </section>

      {/* 3. Product Sections */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <ProductGridSkeleton count={4} />
          </div>
          <div>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <ProductGridSkeleton count={4} />
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* Section: Popular Medicines */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Popular Medicines</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Top trusted selections</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {sectionsData?.popular.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </section>

          {/* Section: Best Sellers */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Best Sellers</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Most purchased products</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {sectionsData?.bestSellers.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </section>

          {/* Section: New Arrivals */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">New Arrivals</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Newly stocked inventories</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {sectionsData?.newArrivals.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </section>

          {/* Promotional Banner Box */}
          <section className="mx-4 sm:mx-6 lg:mx-8">
            <div className="max-w-7xl mx-auto bg-gradient-to-r from-accent-600 to-sky-500 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-2">
                <span className="bg-sky-700/50 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Special Promo</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold">Need Help with Prescription medicines?</h3>
                <p className="text-sm text-sky-100 max-w-xl">Search and add tablets, capsules, syrups and devices to your cart. Apply the test discount coupon at checkout for instant benefits!</p>
              </div>
              <Link 
                to="/products" 
                className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-full font-bold text-sm shadow transition-all shrink-0 hover:scale-105"
              >
                Upload & Search Now
              </Link>
            </div>
          </section>

          {/* Section: Health Essentials */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Health Essentials</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Vitamins, minerals and diabetic monitoring</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {sectionsData?.healthEssentials.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </section>

          {/* Section: Featured Products */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Featured Products</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Handpicked for your health</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {sectionsData?.featured.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </section>

        </div>
      )}

    </div>
  );
};

export default Home;
