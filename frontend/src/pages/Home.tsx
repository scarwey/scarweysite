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
const FiCheck = Icons.FiCheck as any;
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

  // Enhanced hero slides with better color harmony and contrast
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
      gradient: "from-red-500 via-pink-500 to-rose-600",
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
      gradient: "from-orange-500 via-red-500 to-pink-600",
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

  // Auto-slide effect with enhanced timing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Increased to 6 seconds for better UX
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Enhanced touch handlers for mobile swipe
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
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    if (isRightSwipe) {
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
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? 'translate-x-0 opacity-100' : 
              index < currentSlide ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
            }`}
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
                } ${index === 0 ? 'text-gray-800' : 'text-white'}`}>
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
        ))}

        {/* Enhanced Navigation Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="hidden md:block absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/20 transition-all z-20 border border-white/20"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="hidden md:block absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/20 transition-all z-20 border border-white/20"
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

      {/* 2. Enhanced Flash Deals with Real Products */}
      <section className="py-20 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
                             radial-gradient(circle at 80% 50%, white 2px, transparent 2px)`,
            backgroundSize: '100px 100px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <FiPercent className="text-yellow-300 animate-pulse" size={36} />
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Süper İndirimler
              </h2>
              <FiPercent className="text-yellow-300 animate-pulse" size={36} />
            </div>
            <p className="text-white/90 text-xl font-medium">En yüksek indirimli ürünlerimiz</p>
          </div>

          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
            </div>
          ) : saleProducts.length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {saleProducts.slice(0, 8).map((product) => (
                  <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto pb-4">
                <div className="flex gap-4" style={{ width: `${Math.min(saleProducts.length, 8) * 280}px` }}>
                  {saleProducts.slice(0, 8).map((product) => (
                    <div key={product.id} className="min-w-[260px]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* View All Button */}
              <div className="text-center mt-12">
                <Link
                  to="/products?sale=true"
                  className="inline-flex items-center bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Tüm İndirimleri Gör
                  <FiArrowRight className="ml-3" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-white text-xl">Şu an aktif indirim bulunmuyor.</p>
              <Link to="/products" className="text-yellow-300 hover:text-yellow-200 mt-4 inline-block font-semibold">
                Tüm ürünleri görüntüle
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. Enhanced Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              En beğenilen ve en çok satan ürünlerimizi keşfedin
            </p>
          </div>

          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.slice(0, 8).map((product) => (
                  <div key={product.id} className="group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  to="/products?featured=true"
                  className="inline-flex items-center bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Kategoriler
            </h2>
            <p className="text-gray-600 text-xl">İhtiyacınız olan her şey burada</p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?categoryId=${category.id}`}
                  className="group block"
                >
                  <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:via-orange-300 group-hover:to-orange-400 border-2 border-orange-200 group-hover:border-orange-400 rounded-3xl p-6 md:p-8 text-center transition-all duration-300 group-hover:shadow-xl min-h-[120px] md:min-h-[140px] flex items-center justify-center relative overflow-hidden">
                    {/* Floating Elements - Fixed positioning */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-300/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse" />
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-orange-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-bounce" />
                    
                    <h3 className="font-bold text-orange-800 group-hover:text-orange-900 text-sm md:text-base transition-colors duration-300 relative z-10 text-center">
                      {category.name}
                    </h3>
                    
                    {/* Hover Overlay - Subtle effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover:from-orange-400/5 group-hover:to-orange-600/10 transition-all duration-300 rounded-3xl" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-xl">Kategoriler yükleniyor...</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Enhanced Customer Benefits */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Müşteri Memnuniyeti Önceliğimiz
            </h2>
            <p className="text-gray-600 text-xl">Size en iyi alışveriş deneyimini sunmak için çalışıyoruz</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { 
                title: 'Ücretsiz Kargo', 
                subtitle: '1500₺ üzeri', 
                icon: '🚚', 
                color: 'from-green-400 to-emerald-500', 
                hoverColor: 'hover:from-green-500 hover:to-emerald-600',
                description: 'Hızlı ve güvenli teslimat'
              },
              { 
                title: 'Hızlı Teslimat', 
                subtitle: '1-3 gün içinde', 
                icon: '⚡', 
                color: 'from-yellow-400 to-orange-500', 
                hoverColor: 'hover:from-yellow-500 hover:to-orange-600',
                description: 'Siparişiniz anında kargoda'
              },
              { 
                title: 'Kapıda Ödeme', 
                subtitle: 'Güvenli teslimat', 
                icon: '💰', 
                color: 'from-blue-400 to-indigo-500', 
                hoverColor: 'hover:from-blue-500 hover:to-indigo-600',
                description: 'Ürününü gör, sonra öde'
              },
              { 
                title: 'Kolay İade', 
                subtitle: '14 gün', 
                color: 'from-purple-400 to-pink-500', 
                hoverColor: 'hover:from-purple-500 hover:to-pink-600', 
                icon: '↩️',
                description: 'Koşulsuz iade garantisi'
              },
              { 
                title: 'WhatsApp Destek', 
                subtitle: 'Anında yanıt', 
                color: 'from-green-400 to-teal-500', 
                hoverColor: 'hover:from-green-500 hover:to-teal-600', 
                icon: '💬',
                description: '7/24 canlı destek',
                clickable: true
              },
            ].map((benefit, index) => (
              <div 
                key={index} 
                className={`group cursor-pointer ${benefit.clickable ? 'transform hover:scale-105' : ''}`}
                onClick={() => {
                  if (benefit.clickable) {
                    handleWhatsAppClick();
                  }
                }}
              >
                <div className={`bg-gradient-to-br ${benefit.color} ${benefit.hoverColor} rounded-3xl p-6 text-center transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 text-white relative overflow-hidden min-h-[200px] flex flex-col justify-center`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 30% 20%, white 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }} />
                  </div>
                  
                  {/* Icon */}
                  <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {benefit.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-lg md:text-xl mb-2 relative z-10">
                    {benefit.title}
                  </h3>
                  <p className="text-sm opacity-90 font-medium mb-2 relative z-10">
                    {benefit.subtitle}
                  </p>
                  <p className="text-xs opacity-80 relative z-10">
                    {benefit.description}
                  </p>

                  {/* Floating Elements */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-white/30 rounded-full animate-ping" />
                  <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Enhanced Features Section with Glassmorphism */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `conic-gradient(from 45deg, transparent, white, transparent)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-purple-100 text-xl max-w-3xl mx-auto">
              Size en iyi alışveriş deneyimini sunuyoruz. Premium kalite, uygun fiyat ve mükemmel hizmet.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FiTruck,
                title: 'Hızlı Teslimat',
                description: 'Siparişleriniz 1-3 iş günü içinde kapınızda',
                color: 'from-green-400 to-emerald-500'
              },
              {
                icon: FiShield,
                title: 'Güvenli Ödeme',
                description: 'SSL sertifikası ile %100 güvenli alışveriş',
                color: 'from-blue-400 to-cyan-500'
              },
              {
                icon: FiRefreshCw,
                title: 'Kolay İade',
                description: '14 gün içinde koşulsuz iade garantisi',
                color: 'from-purple-400 to-pink-500'
              },
              {
                icon: FiMessageCircle,
                title: 'WhatsApp Destek',
                description: 'Anında WhatsApp ile iletişime geçin',
                color: 'from-green-400 to-teal-500',
                clickable: true
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`group p-8 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl ${
                  feature.clickable ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (feature.clickable) {
                    handleWhatsAppClick('Merhaba! 7/24 destek almak istiyorum.');
                  }
                }}
              >
                {/* Floating Icon */}
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative`}>
                  <feature.icon className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-center group-hover:text-yellow-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-purple-100 text-center leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Link
              to="/products"
              className="inline-flex items-center bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/30"
            >
              <FiStar className="mr-3" />
              Alışverişe Başla
              <FiArrowRight className="ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Enhanced Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Özel Fırsatları Kaçırma!
            </h2>
            <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
              Yeni ürünler, özel indirimler ve kampanyalardan ilk sen haberdar ol!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="E-posta adresinizi girin"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl">
                Abone Ol
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mt-4">
              <FiCheck className="inline mr-2" />
              Spam göndermiyoruz, istediğiniz zaman ayrılabilirsiniz
            </p>
          </div>
        </div>
      </section>

      {/* 8. Enhanced Footer CTA */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-black text-gray-800 mb-6">
              Hemen Alışverişe Başlayın!
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Binlerce ürün, uygun fiyatlar ve hızlı teslimat sizi bekliyor
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <FiStar className="mr-3" />
                Ürünleri Keşfet
                <FiArrowRight className="ml-3" />
              </Link>
              
              <button
                onClick={() => handleWhatsAppClick('Merhaba! Alışveriş konusunda yardım almak istiyorum.')}
                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <FiMessageCircle className="mr-3" />
                WhatsApp Destek
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Component */}
      <WhatsAppFloat />
    </div>
  );
};

export default Home;