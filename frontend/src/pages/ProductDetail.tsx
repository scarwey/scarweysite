import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { AppDispatch, RootState } from '../store';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import api from '../services/api';
import { Product, ProductVariant } from '../types';

const FiShoppingCart = Icons.FiShoppingCart as any;
const FiHeart = Icons.FiHeart as any;
const FiShare2 = Icons.FiShare2 as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiMinus = Icons.FiMinus as any;
const FiPlus = Icons.FiPlus as any;
const FiTruck = Icons.FiTruck as any;
const FiShield = Icons.FiShield as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiStar = Icons.FiStar as any;
const FiMessageCircle = Icons.FiMessageCircle as any;
const FiEye = Icons.FiEye as any;
const FiClock = Icons.FiClock as any;
const FiGift = Icons.FiGift as any;
const FiCheck = Icons.FiCheck as any;
const FiAlertCircle = Icons.FiAlertCircle as any;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: cartLoading } = useSelector((state: RootState) => state.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Beden seçimi için state'ler
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantPrice, setVariantPrice] = useState<number>(0);
  const [showSizeError, setShowSizeError] = useState(false);

  // Yakınlaştırma için yeni state'ler
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/600x600?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://scarwey.onrender.com${imageUrl}`;
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await api.get<Product>(`/products/${id}`);
      setProduct(response.data);
      
      // Eğer ürünün bedenleri varsa ilk bedeni seç
      if (response.data.hasSizes && response.data.variants && response.data.variants.length > 0) {
        const firstVariant = response.data.variants.find(v => v.isAvailable && v.stockQuantity > 0);
        if (firstVariant) {
          setSelectedVariant(firstVariant);
          await fetchVariantPrice(firstVariant.id);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  // Variant fiyatını getir
  const fetchVariantPrice = async (variantId: number) => {
    try {
      const response = await api.get<{ price: number }>(`/products/variants/${variantId}/price`);
      setVariantPrice(response.data.price);
    } catch (error) {
      console.error('Error fetching variant price:', error);
    }
  };

  // Beden seçimi
  const handleVariantChange = async (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowSizeError(false);
    
    // Seçilen bedene göre quantity'yi sınırla
    if (quantity > variant.stockQuantity) {
      setQuantity(variant.stockQuantity);
    }
    
    // Variant fiyatını getir
    await fetchVariantPrice(variant.id);
  };

  // Fareyle resmin üzerine gelince yakınlaştırma
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // X ve Y değerlerini 0-1 arasında sınırla
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    
    setMousePosition({ x: e.clientX, y: e.clientY });
    setImagePosition({ x: clampedX * 100, y: clampedY * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Güncellenmiş sepete ekleme
  const handleAddToCart = () => {
    if (!product) return;

    // Eğer ürünün bedenleri varsa beden seçimi zorunlu
    if (product.hasSizes && product.variants && product.variants.length > 0) {
      if (!selectedVariant) {
        setShowSizeError(true);
        return;
      }
      
      // Variant bazında sepete ekle
      dispatch(addToCart({ 
        productId: product.id, 
        productVariantId: selectedVariant.id,
        quantity 
      }));
    } else {
      // Normal ürün - variant olmadan sepete ekle
      dispatch(addToCart({ 
        productId: product.id, 
        quantity 
      }));
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      dispatch(toggleWishlist(product));
    }
  };

  const handleQuantityChange = (change: number) => {
    const maxStock = selectedVariant ? selectedVariant.stockQuantity : (product?.stockQuantity || 10);
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const calculateDiscountPercentage = () => {
    if (product && product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };

  // Güncel fiyatı hesapla (variant fiyatı varsa onu kullan)
  const getCurrentPrice = () => {
    if (selectedVariant && variantPrice > 0) {
      return variantPrice;
    }
    return product?.discountPrice || product?.price || 0;
  };

  // Güncel stok miktarını hesapla
  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    return product?.stockQuantity || 0;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Show toast notification here
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEye size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ürün bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
          >
            Ürünlere Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = calculateDiscountPercentage();
  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  
  // Resim listesini hazırla
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => ({
        ...img,
        imageUrl: getImageUrl(img.imageUrl)
      }))
    : [{ 
        imageUrl: 'https://placehold.co/600x600?text=No+Image', 
        altText: product.name,
        isMainImage: true,
        displayOrder: 0
      }];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm">
            <ol className="flex items-center space-x-2">
              <li><a href="/" className="text-gray-500 hover:text-orange-600 transition-colors">Ana Sayfa</a></li>
              <li className="text-gray-300">/</li>
              <li><a href="/products" className="text-gray-500 hover:text-orange-600 transition-colors">Ürünler</a></li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-800 font-medium truncate max-w-xs">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Images - Sol taraf */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Ana resim */}
              <div className="relative mb-4 group">
                <div 
                  className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={images[selectedImage].imageUrl}
                    alt={images[selectedImage].altText || product.name}
                    className="w-full h-full object-contain transition-transform duration-300 cursor-crosshair"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
                    }}
                  />
                  
                  {/* Desktop Zoom Indicator */}
                  <div className="hidden lg:block absolute inset-0 pointer-events-none">
                    {isHovering && (
                      <div 
                        className="absolute border-2 border-orange-400 bg-orange-400 bg-opacity-20"
                        style={{
                          left: `${Math.max(0, Math.min(75, imagePosition.x - 12.5))}%`,
                          top: `${Math.max(0, Math.min(75, imagePosition.y - 12.5))}%`,
                          width: '25%',
                          height: '25%'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discountPercentage > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                        %{discountPercentage} İNDİRİM
                      </span>
                    )}
                    {currentStock < 10 && currentStock > 0 && (
                      <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        SON {currentStock} ADET!
                      </span>
                    )}
                  </div>

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <FiChevronLeft size={20} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <FiChevronRight size={20} className="text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail images */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-orange-500 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-orange-300 hover:scale-105'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altText || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Sağ taraf */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4 sm:space-y-6">
              {/* Header section - Mobil optimized */}
              <div>
                {product.brand && (
                  <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 leading-tight mb-3 break-words">
                  {product.name}
                </h1>
              </div>

              {/* Beden Seçimi */}
              {product.hasSizes && product.variants && product.variants.length > 0 && (
                <div className="border-2 border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Beden Seçin</h3>
                    {selectedVariant && (
                      <span className="text-sm text-gray-600">
                        Stok: {selectedVariant.stockQuantity} adet
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                    {product.variants
                      .filter(variant => variant.isAvailable)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantChange(variant)}
                          disabled={variant.stockQuantity === 0}
                          className={`
                            p-3 text-sm font-medium border-2 rounded-lg transition-all duration-200
                            ${selectedVariant?.id === variant.id 
                              ? 'border-orange-500 bg-orange-50 text-orange-700' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                            ${variant.stockQuantity === 0 
                              ? 'opacity-50 cursor-not-allowed line-through' 
                              : 'hover:scale-105'
                            }
                          `}
                        >
                          {variant.sizeDisplay || variant.size}
                        </button>
                      ))
                    }
                  </div>
                  
                  {showSizeError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                      <FiAlertCircle size={16} />
                      <span>Lütfen bir beden seçin</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price section - Mobil optimized */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                {product.discountPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-600">
                        ₺{currentPrice.toFixed(2)}
                      </span>
                      <span className="text-sm sm:text-base md:text-lg text-gray-400 line-through">
                        ₺{product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">
                      ₺{(product.price - currentPrice).toFixed(2)} tasarruf ediyorsunuz!
                    </p>
                  </div>
                ) : (
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    ₺{currentPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-3">
                {currentStock > 0 ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Stokta Mevcut</span>
                    </div>
                    {currentStock < 10 && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                        Sadece {currentStock} adet kaldı!
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold">Stokta Yok</span>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= currentStock}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-500">
                    Toplam: <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">
                      ₺{(currentPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || currentStock === 0}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FiShoppingCart size={18} className="sm:size-6" />
                    <span className="hidden xs:inline">{cartLoading ? 'Ekleniyor...' : 'Sepete Ekle'}</span>
                    <span className="xs:hidden">Sepet</span>
                  </button>

                  <button 
                    onClick={handleToggleWishlist}
                    className={`p-2.5 sm:p-3 border-2 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 ${
                      isInWishlist 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50'
                    }`}
                    title={isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  >
                    <FiHeart size={18} className={`sm:size-6 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                    title="Paylaş"
                  >
                    <FiShare2 size={18} className="sm:size-6" />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiTruck className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Ücretsiz Kargo</p>
                    <p className="text-xs text-green-600">₺1500 üzeri</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiShield className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Güvenli Ödeme</p>
                    <p className="text-xs text-blue-600">Kapıda ödeme</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiRefreshCw className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800">Kolay İade</p>
                    <p className="text-xs text-purple-600">14 gün garanti</p>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiClock className="text-blue-600" size={20} />
                  <span className="font-semibold text-gray-800">Teslimat Bilgileri</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <FiCheck className="inline text-green-500 mr-1" size={14} />
                  Bugün sipariş verirseniz <strong>yarın kargoda</strong>
                </p>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mt-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`py-4 border-b-2 font-semibold transition-colors ${
                      activeTab === 'description'
                        ? 'text-orange-600 border-orange-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Ürün Açıklaması
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 border-b-2 font-semibold transition-colors ${
                      activeTab === 'details'
                        ? 'text-orange-600 border-orange-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Ürün Özellikleri
                  </button>
                 
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">SKU:</span>
                        <span className="text-gray-900">{product.sku}</span>
                      </div>
                      {product.brand && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Marka:</span>
                          <span className="text-gray-900">{product.brand}</span>
                        </div>
                      )}
                      {product.gender && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Cinsiyet:</span>
                          <span className="text-gray-900">{product.gender}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Stok Durumu:</span>
                        <span className="text-gray-900">{currentStock} adet</span>
                      </div>
                      {product.category && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Kategori:</span>
                          <span className="text-gray-900">{product.category.name}</span>
                        </div>
                      )}
                      {selectedVariant && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Seçilen Beden:</span>
                          <span className="text-gray-900 font-bold">
                            {selectedVariant.sizeDisplay || selectedVariant.size}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <FiMessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Henüz değerlendirme bulunmuyor.</p>
                      <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        İlk Yorumu Siz Yazın
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Yakınlaştırma Penceresi - Ana resimle aynı boyut */}
      {isHovering && (
        <div 
          className="hidden lg:block fixed z-[9999] pointer-events-none"
          style={{
            left: 'calc(50% + 30px)', // Ana resmin hemen yanında
            top: '200px',              // Ana resimle aynı seviyede
            width: '100%',             // Ana resim container'ı kadar
            maxWidth: '500px',         // Maksimum genişlik
            aspectRatio: '1'           // Kare oran
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-400 overflow-hidden relative w-full h-full">
            {/* Yakınlaştırılmış görsel - sadece fare altındaki alan */}
            <div 
              className="w-full h-full"
              style={{
                background: `url(${images[selectedImage].imageUrl}) no-repeat`,
                backgroundSize: '300%', // 3x yakınlaştırma
                backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                transition: 'background-position 0.1s ease-out'
              }}
            />
            
            {/* Zoom indicator */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white text-sm font-medium px-3 py-2 rounded-lg">
              3x Yakınlaştırma
            </div>
            
            {/* Alt bilgi */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white text-xs px-3 py-2 rounded-lg">
              Farenin altındaki alan
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Kapat Butonu */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white text-xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
            
            {/* Resim */}
            <img
              src={images[selectedImage].imageUrl}
              alt={images[selectedImage].altText || product.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;