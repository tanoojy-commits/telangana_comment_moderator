import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailSkeleton } from '../components/LoadingSpinner';
import { Heart, ShoppingCart, Info, Minus, Plus, ChevronLeft } from 'lucide-react';

export const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  // Data States
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [relatedMedicines, setRelatedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProductById(productId);
        setProduct(prod);
        
        // Similar products
        const similar = await productService.getSimilarProducts(productId, prod.category);
        setSimilarProducts(similar);
        
        // Related medicines
        const related = await productService.getRelatedMedicines(productId, prod.brand);
        setRelatedMedicines(related);
        
        setQuantity(1); // reset qty on details page swap
        setActiveImageIdx(0);
      } catch (err) {
        console.error('Error fetching product details:', err);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const wishlisted = isInWishlist(product.productId);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Cloned images for thumbnail gallery demo
  const images = [
    product.image,
    product.image + '&auto=compress&cs=tinysrgb&h=150', // modified copy
    product.image + '&q=80' // modified copy
  ];

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity(prev => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 page-fade-in">
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Catalog
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          
          {/* Active Image Box */}
          <div className="relative aspect-square bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/60 shadow flex items-center justify-center">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-all"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-905/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-650 text-white font-bold px-4 py-1.5 rounded-full uppercase tracking-wider text-sm shadow">
                  Out of Stock
                </span>
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          <div className="flex gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-20 h-20 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 overflow-hidden transition-all ${
                  activeImageIdx === idx 
                    ? 'border-primary-600 scale-105' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>

        {/* Right Side: Product Details & Purchase controls */}
        <div className="space-y-6">
          
          {/* Brand/Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-slate-300 dark:text-slate-650">•</span>
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Manufacturer: <span className="font-bold text-slate-500 dark:text-slate-400">{product.manufacturer}</span>
          </p>

          {/* Pricing Block */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Best Price</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    MRP ₹{product.mrp}
                  </span>
                  <span className="text-xs font-extrabold text-red-500">
                    Save ₹{product.mrp - product.price}
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Inclusive of all taxes</p>
          </div>

          {/* Quantity selector & Stock indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Quantity</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 px-2 py-1">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 text-slate-500 hover:text-primary-600 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-800 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-1.5 text-slate-500 hover:text-primary-600 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-xs">
                {isOutOfStock ? (
                  <span className="text-red-500 font-bold">Out of stock</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    Availability: <span className="text-emerald-500 font-bold">{product.stock} units left</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Checkout CTAs & Wishlist toggle */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all shadow ${
                isOutOfStock 
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:scale-[1.01]'
              }`}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-500/10 ${
                isOutOfStock
                  ? 'bg-slate-205 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-[1.01]'
              }`}
            >
              Buy Now
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-750 flex items-center justify-center transition-all ${
                wishlisted
                  ? 'bg-red-500 border-red-500 text-white shadow shadow-red-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-550 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>

          </div>

        </div>
      </div>

      {/* Medical/Drug Information Tabs section */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-6 sm:p-8 shadow-sm">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-lg mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Info size={20} className="text-primary-600" />
          Medical Information / Uses
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          
          <div className="space-y-4">
            <div>
              <h4 className="font-black text-slate-805 dark:text-white mb-1">Description</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{product.description || 'No medical description available.'}</p>
            </div>
            <div>
              <h4 className="font-black text-slate-805 dark:text-white mb-1">Primary Uses</h4>
              <p className="text-slate-655 dark:text-slate-300 leading-relaxed text-xs">{product.uses || 'Not specified.'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-black text-slate-850 dark:text-white mb-1">Dosage & Administration</h4>
              <p className="text-slate-655 dark:text-slate-350 leading-relaxed text-xs">{product.dosageInformation || 'Consume as directed by your physician.'}</p>
            </div>
            <div>
              <h4 className="font-black text-slate-850 dark:text-white mb-1">Possible Side Effects</h4>
              <p className="text-slate-655 dark:text-slate-350 leading-relaxed text-xs">{product.sideEffects || 'Consult doctor if side effects arise.'}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Section: Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">
            Similar Products in {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Related Medicines */}
      {relatedMedicines.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">
            Related Medicines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedMedicines.map(p => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
