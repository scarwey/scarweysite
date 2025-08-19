import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchFeaturedProducts, fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';
import * as Icons from 'react-icons/fi';
import WhatsAppFloat from '../components/common/WhatsAppFloat';

const FiArrowRight = Icons.FiArrowRight as any;
const FiTruck = Icons.FiTruck as any;
const FiShield = Icons.FiShield as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiPercent = Icons.FiPercent as any;
const FiMessageCircle = Icons.FiMessageCircle as any;
const FiStar = Icons.FiStar as any;
const FiZap = Icons.FiZap as any;

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { featuredProducts, products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { categories, isLoading: categoriesLoading } = useSelector((state: RootState) => state.categories);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Get sale products (products with discounts)
  const saleProducts = products?.filter(product => 
    product.discountPrice && product.discountPrice < product.price
  ).sort((a, b) => {
    // Sort by highest discount percentage
    const discountA = ((a.price - (a.discountPrice || 0)) / a.price) * 100;
    const discountB = ((b.price - (b.discountPrice || 0)) / b.price) * 100;
    return discountB - discountA;
  }) || [];

  // Enhanced hero slides with consistent light colors like first slide
  const heroSlides = [
    {
      id: 1,
      title: "2025 Koleksiyonu",
      subtitle: "Yılın en trend parçaları burada",
      description: "Premium kalite, uygun fiyat. Hayallerinizdeki stilin keyfini çıkarın.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop&q=80",
      cta: "Koleksiyonu Keşfet",
      link: "/products",
      badge: "YENİ",
      gradient: "from-indigo-900 via-blue-900 to-slate-900",
      overlayPattern: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)"
    },
    {
      id: 2,
      title: "Süper İndirimler",
      subtitle: "Seçili ürünlerde %70'e varan fırsatlar",
      description: "Bu kadar avantajlı fiyatları bir daha bulamazsınız. Hemen keşfedin!",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop&q=80",
      cta: "İndirimleri Gör",
      link: "/products?sale=true",
      badge: "FIRSAT",
      gradient: "from-indigo-900 via-blue-900 to-slate-900",
      overlayPattern: "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)"
    },
    {
      id: 3,
      title: "Kaliteli Ürünler",
      subtitle: "En iyi kalitede ürünler burada",
      description: "Uzun yıllar kullanabileceğiniz dayanıklı ve şık ürünlerin adresi.",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop&q=80",
      cta: "Kaliteyi Keşfet",
      link: "/products?featured=true",
      badge: "KALİTE",
      gradient: "from-indigo-900 via-blue-900 to-slate-900",
      overlayPattern: "conic-gradient(from 45deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.05))"
    }
  ];

  // WhatsApp contact function
  const handleWhatsAppClick = (message = 'Merhaba! Scarwey hakkında bilgi almak istiyorum.') => {
    const phoneNumber = '905419407534';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    try {
      dispatch(fetchFeaturedProducts());
      dispatch(fetchProducts({ page: 1, limit: 50 })); // Fetch products for sale section
      dispatch(fetchCategories());
    } catch (error) {
      console.error('API Error:', error);
    }
  }, [dispatch]);

  // Auto-slide effect with enhanced timing - Daha Yavaş
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000); // 8 saniyeye çıkarıldı
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Enhanced touch handlers for mobile swipe - Doğru Yön
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Sol kaydırma = sonraki slide
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    if (isRightSwipe) {
      // Sağ kaydırma = önceki slide  
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Enhanced Hero Section with Modern Design */}
      <section 
        className="relative h-[75vh] min-h-[600px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {heroSlides.map((slide, index) => {
          // Mevcut slide'ın pozisyonunu hesapla
          let position = 'translate-x-full opacity-0'; // Varsayılan: sağda bekliyor
          
          if (index === currentSlide) {
            position = 'translate-x-0 opacity-100'; // Merkez
          } else {
            // Önceki slide sola gider, sonraki slide sağda bekler
            const prevIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
            if (index === prevIndex) {
              position = '-translate-x-full opacity-0'; // Sol tarafta
            }
          }
          
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-2000 ease-in-out ${position}`}
            >
            {/* Background Image with Parallax Effect */}
            <div 
              className="absolute inset-0 bg-cover bg-center transform scale-110 transition-transform duration-1000"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? 'scale(105)' : 'scale(110)'
              }}
            />
            
            {/* Enhanced Gradient Overlay */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-85`}
              style={{ backgroundImage: slide.overlayPattern }}
            />
            
            {/* Animated Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 z-10">
                <div className={`max-w-3xl transition-all duration-1000 delay-300 ${
                  index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                } text-gray-800`}>
                  {/* Animated Badge */}
                  <div className="mb-6">
                    <span className={`inline-flex items-center backdrop-blur-md text-sm px-4 py-2 rounded-full font-semibold border animate-pulse ${
                      index === 0 
                        ? 'bg-orange-100/90 text-orange-800 border-orange-300' 
                        : 'bg-white/20 text-white border-white/30'
                    }`}>
                      <FiZap className="mr-2" size={16} />
                      {slide.badge}
                    </span>
                  </div>
                  
                  {/* Main Title with Gradient Text */}
                  <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
                    <span className={`bg-clip-text text-transparent ${
                      index === 0 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600' 
                        : 'bg-gradient-to-r from-white to-gray-200'
                    }`}>
                      {slide.title}
                    </span>
                  </h1>
                  
                  {/* Subtitle */}
                  <h2 className={`text-xl md:text-4xl font-light mb-6 ${
                    index === 0 ? 'opacity-80 text-gray-700' : 'opacity-95 text-gray-100'
                  }`}>
                    {slide.subtitle}
                  </h2>
                  
                  {/* Description */}
                  <p className={`text-lg md:text-xl mb-10 max-w-2xl leading-relaxed ${
                    index === 0 ? 'opacity-70 text-gray-600' : 'opacity-90 text-white'
                  }`}>
                    {slide.description}
                  </p>
                  
                  {/* Enhanced CTA Button */}
                  <Link
                    to={slide.link}
                    className="group inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden"
                  >
                    <span className="relative z-10">{slide.cta}</span>
                    <FiArrowRight className="ml-3 transform group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" />
              <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
              <div className="absolute top-1/2 right-1/6 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" />
            </div>
            </div>
          );
        })}

        {/* Enhanced Navigation Controls - Çok Daha Şeffaf */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="hidden md:block absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/5 backdrop-blur-sm text-white/40 p-4 rounded-full hover:bg-black/10 hover:text-white/60 transition-all z-20"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="hidden md:block absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/5 backdrop-blur-sm text-white/40 p-4 rounded-full hover:bg-black/10 hover:text-white/60 transition-all z-20"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Enhanced Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-12 h-3 bg-white rounded-full' 
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Enhanced Flash Deals with Real Products - Beyaz Arka Plan */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        {/* Background Pattern - Çok Hafif */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #f97316 1px, transparent 1px),
                             radial-gradient(circle at 80% 50%, #f97316 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <FiPercent className="text-red-500 animate-pulse" size={24} />
              <h2 className="text-2xl md:text-5xl font-black text-gray-800">
                Süper İndirimler
              </h2>
              <FiPercent className="text-red-500 animate-pulse" size={24} />
            </div>
            <p className="text-gray-600 text-base md:text-xl font-medium">En yüksek indirimli ürünlerimiz</p>
          </div>

          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
            </div>
          ) : saleProducts.length > 0 ? (
            <>
              {/* Desktop Horizontal Scroll with Navigation */}
              <div className="hidden md:block relative">
                <div 
                  id="sale-scroll"
                  className="overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex gap-6" style={{ width: `${Math.min(saleProducts.length, 8) * 320}px` }}>
                    {saleProducts.slice(0, 8).map((product) => (
                      <div key={product.id} className="min-w-[300px] transform hover:scale-105 transition-transform duration-300">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {saleProducts.length > 4 && (
                  <>
                    <button
                      onClick={() => {
                        const scrollContainer = document.getElementById('sale-scroll');
                        if (scrollContainer) {
                          scrollContainer.scrollBy({ left: -320, behavior: 'smooth' });
                        }
                      }}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 z-10"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        const scrollContainer = document.getElementById('sale-scroll');
                        if (scrollContainer) {
                          scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 z-10"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-4" style={{ width: `${Math.min(saleProducts.length, 8) * 280}px` }}>
                  {saleProducts.slice(0, 8).map((product) => (
                    <div key={product.id} className="min-w-[260px]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* View All Button */}
              <div className="text-center mt-8 md:mt-12">
                <Link
                  to="/products?sale=true"
                  className="inline-flex items-center bg-gray-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Tüm İndirimleri Gör
                  <FiArrowRight className="ml-3" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-xl">Şu an aktif indirim bulunmuyor.</p>
              <Link to="/products" className="text-orange-500 hover:text-orange-600 mt-4 inline-block font-semibold">
                Tüm ürünleri görüntüle
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. Enhanced Featured Products */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-black text-gray-800 mb-2 md:mb-4">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto">
              En beğenilen ve en çok satan ürünlerimizi keşfedin
            </p>
          </div>

          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <>
              {/* Desktop Horizontal Scroll with Navigation */}
              <div className="hidden md:block relative">
                <div 
                  id="featured-scroll"
                  className="overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex gap-6" style={{ width: `${Math.min(featuredProducts.length, 8) * 320}px` }}>
                    {featuredProducts.slice(0, 8).map((product) => (
                      <div key={product.id} className="min-w-[300px] group">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {featuredProducts.length > 4 && (
                  <>
                    <button
                      onClick={() => {
                        const scrollContainer = document.getElementById('featured-scroll');
                        if (scrollContainer) {
                          scrollContainer.scrollBy({ left: -320, behavior: 'smooth' });
                        }
                      }}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 z-10"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        const scrollContainer = document.getElementById('featured-scroll');
                        if (scrollContainer) {
                          scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 z-10"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-4" style={{ width: `${Math.min(featuredProducts.length, 8) * 280}px` }}>
                  {featuredProducts.slice(0, 8).map((product) => (
                    <div key={product.id} className="min-w-[260px] group">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-8 md:mt-12">
                <Link
                  to="/products?featured=true"
                  className="inline-flex items-center bg-gray-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Tüm Öne Çıkanları Gör
                  <FiArrowRight className="ml-3" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-xl">Henüz öne çıkan ürün bulunmuyor.</p>
              <Link to="/products" className="text-purple-600 hover:text-purple-700 mt-4 inline-block font-semibold">
                Tüm ürünleri görüntüle
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. Enhanced Categories Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-black text-gray-800 mb-2 md:mb-4">
              Kategoriler
            </h2>
            <p className="text-gray-600 text-base md:text-xl">İhtiyacınız olan her şey burada</p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <>
              {/* Desktop Horizontal Scroll with Navigation */}
              <div className="hidden md:block relative">
                <div 
                  id="categories-scroll"
                  className="overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex gap-6" style={{ width: `${Math.min(categories.length, 6) * 220}px` }}>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?categoryIds=${category.id}`}
                        className="group block min-w-[200px]"
                      >
                        <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:via-orange-300 group-hover:to-orange-400 border-2 border-orange-200 group-hover:border-orange-400 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center transition-all duration-300 group-hover:shadow-xl min-h-[120px] md:min-h-[140px] flex items-center justify-center relative overflow-hidden">
                          {/* Floating Elements - Fixed positioning */}
                          <div className="absolute top-1 right-1 md:top-2 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-300/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse" />
                          <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-1 h-1 md:w-1.5 md:h-1.5 bg-orange-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-bounce" />
                          
                          <h3 className="font-bold text-orange-800 group-hover:text-orange-900 text-xs md:text-base transition-colors duration-300 relative z-10 text-center">
                            {category.name}
                          </h3>
                          
                          {/* Hover Overlay - Subtle effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover:from-orange-400/5 group-hover:to-orange-600/10 transition-all duration-300 rounded-2xl md:rounded-3xl" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {categories.length > 5 && (
                  <>
                    <button
                      onClick={() => {
                        const scrollContainer = document.getElementById('categories-scroll');
                        if (scrollContainer) {
                          scrollContainer.scrollBy({ left: -220, behavior: 'smooth' });
                        }
                      }}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 z-10"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        const scrollContainer = document.getElementById('categories-scroll');
                        if (scrollContainer) {
                          scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 z-10"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-3" style={{ width: `${Math.min(categories.length, 6) * 140}px` }}>
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?categoryId=${category.id}`}
                      className="group block min-w-[130px]"
                    >
                      <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:via-orange-300 group-hover:to-orange-400 border-2 border-orange-200 group-hover:border-orange-400 rounded-2xl p-4 text-center transition-all duration-300 group-hover:shadow-xl min-h-[80px] flex items-center justify-center relative overflow-hidden">
                        {/* Floating Elements - Fixed positioning */}
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-300/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse" />
                        <div className="absolute bottom-1 left-1 w-1 h-1 bg-orange-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-bounce" />
                        
                        <h3 className="font-bold text-orange-800 group-hover:text-orange-900 text-xs transition-colors duration-300 relative z-10 text-center">
                          {category.name}
                        </h3>
                        
                        {/* Hover Overlay - Subtle effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover:from-orange-400/5 group-hover:to-orange-600/10 transition-all duration-300 rounded-2xl" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-xl">Kategoriler yükleniyor...</p>
            </div>
          )}
        </div>
      </section>



      {/* 5. Enhanced Features Section - Mobil Optimize ve Daha Kompakt */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-black text-gray-800 mb-2 md:mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto">
              Size en iyi alışveriş deneyimini sunuyoruz
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[
              {
                icon: FiTruck,
                title: 'Hızlı Teslimat',
                description: '1-3 iş günü'
              },
              {
                icon: FiShield,
                title: 'Güvenli Ödeme',
                description: 'Kapıda ödeme kolaylığı'
              },
              {
                icon: FiRefreshCw,
                title: 'Kolay İade',
                description: '14 gün garanti'
              },
              {
                icon: FiMessageCircle,
                title: 'WhatsApp Destek',
                description: 'Anında iletişim',
                clickable: true
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`group p-3 md:p-6 rounded-lg md:rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-105 ${
                  feature.clickable ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (feature.clickable) {
                    handleWhatsAppClick('Merhaba! 7/24 destek almak istiyorum.');
                  }
                }}
              >
                {/* Icon */}
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-4 group-hover:bg-orange-50 transition-all duration-300 shadow-sm border border-gray-100">
                  <feature.icon className="w-4 h-4 md:w-6 md:h-6 text-gray-600 group-hover:text-orange-600 transition-colors duration-300" />
                </div>
                
                <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2 text-center text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed text-xs md:text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8 md:mt-12">
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <FiStar className="mr-2" size={16} />
              Alışverişe Başla
              <FiArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Enhanced Footer CTA - Mobil Navbar'dan Yukarıda */}
      <section className="py-8 md:py-12 bg-white border-t border-gray-200 pb-24 md:pb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl md:text-3xl font-black text-gray-800 mb-3 md:mb-4">
              Hemen Alışverişe Başlayın!
            </h3>
            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
              Binlerce ürün, uygun fiyatlar ve hızlı teslimat sizi bekliyor
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 md:px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <FiStar className="mr-2" size={16} />
                Ürünleri Keşfet
                <FiArrowRight className="ml-2" size={16} />
              </Link>
              
              <button
                onClick={() => handleWhatsAppClick('Merhaba! Alışveriş konusunda yardım almak istiyorum.')}
                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-5 md:px-6 py-3 rounded-xl font-bold text-sm md:text-base transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <FiMessageCircle className="mr-2" size={16} />
                WhatsApp Destek
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Component - Sadece Desktop */}
      <div className="hidden md:block">
        <WhatsAppFloat />
      </div>
    </div>
  );
};

export default Home;