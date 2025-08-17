import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { AppDispatch, RootState } from '../store';
import { fetchProducts, setFilters } from '../store/slices/productSlice';
import { fetchHierarchicalCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';

const FiFilter = Icons.FiFilter as any;
const FiX = Icons.FiX as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiChevronUp = Icons.FiChevronUp as any;

// Responsive hook
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  
  // Hierarchical kategori state'leri
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  const { products, pagination, filters, isLoading } = useSelector((state: RootState) => state.products);
  const { hierarchicalCategories, isLoadingHierarchical } = useSelector((state: RootState) => state.categories);
  
  // Responsive hook kullanımı
  const { width: windowWidth } = useWindowSize();

  // Local filter states - Multi-select için array'e çevir
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');

  // Gender seçenekleri
  const genderOptions = [
    { value: '', label: 'Tüm Cinsiyetler' },
    { value: 'Erkek', label: 'Erkek' },
    { value: 'Kadın', label: 'Kadın' },
    { value: 'Uniseks', label: 'Uniseks' },
    { value: 'Çocuk', label: 'Çocuk' }
  ];

  // Kategori expand/collapse toggle
  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Multi-kategori ismi bulma helper
  const getCategoryName = (categoryId: string, subCategoryId?: string) => {
    for (const mainCategory of hierarchicalCategories) {
      if (mainCategory.id.toString() === categoryId) {
        if (subCategoryId) {
          // Alt kategori varsa
          const subCat = mainCategory.subCategories.find(sc => sc.id.toString() === subCategoryId);
          if (subCat) {
            return `${mainCategory.name} > ${subCat.name}`;
          }
        }
        return mainCategory.name;
      }
    }
    return 'Bilinmeyen Kategori';
  };

  // Seçili kategorilerin isimlerini al
  const getSelectedCategoryNames = () => {
    const names: Array<{id: string, name: string, type: 'main' | 'sub', parentId?: string}> = [];
    
    // Ana kategoriler
    selectedCategories.forEach(catId => {
      names.push({
        id: catId,
        name: getCategoryName(catId),
        type: 'main'
      });
    });
    
    // Alt kategoriler
    selectedSubCategories.forEach(subCatId => {
      // Alt kategorinin hangi ana kategoriye ait olduğunu bul
      for (const mainCategory of hierarchicalCategories) {
        const subCat = mainCategory.subCategories.find(sc => sc.id.toString() === subCatId);
        if (subCat) {
          names.push({
            id: subCatId,
            name: getCategoryName(mainCategory.id.toString(), subCatId),
            type: 'sub',
            parentId: mainCategory.id.toString()
          });
          break;
        }
      }
    });
    
    return names;
  };

  // Fetch hierarchical categories on mount
  useEffect(() => {
    dispatch(fetchHierarchicalCategories());
  }, [dispatch]);

  // TEK useEffect - Multi-kategori sistemi
  useEffect(() => {
    // URL parametrelerini al
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean) || [];
    const subCategoryIds = searchParams.get('subCategoryIds')?.split(',').filter(Boolean) || [];
    const gender = searchParams.get('gender');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sale = searchParams.get('sale');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('🔍 URL Parameters:', { categoryIds, subCategoryIds, gender, search, featured, sale, page });

    // Local state'i güncelle
    if (categoryIds.length > 0) setSelectedCategories(categoryIds);
    if (subCategoryIds.length > 0) setSelectedSubCategories(subCategoryIds);
    if (gender) setSelectedGender(gender);

    // Tüm seçili kategori ID'lerini birleştir
    const allCategoryIds = [...categoryIds, ...subCategoryIds];

    // Tüm filtreleri birleştir
    const allFilters: any = {
      page,
      pageSize: 12,
      sortBy: sortBy as any,
      categoryIds: allCategoryIds.length > 0 ? allCategoryIds.map(id => parseInt(id)) : undefined,
      gender: gender || undefined,
      search: search || undefined,
      featured: featured === 'true' ? true : undefined,
      sale: sale === 'true' ? true : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };

    console.log('🚀 Sending filters to backend:', allFilters);

    // Redux'a gönder
    dispatch(setFilters(allFilters));
    dispatch(fetchProducts(allFilters));
  }, [searchParams, minPrice, maxPrice, sortBy, dispatch]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // Multi-select ana kategori toggle
  const toggleMainCategory = (categoryId: string) => {
    const isCurrentlySelected = selectedCategories.includes(categoryId);
    
    if (isCurrentlySelected) {
      // Ana kategori kaldırılıyorsa
      const newCategories = selectedCategories.filter(id => id !== categoryId);
      setSelectedCategories(newCategories);
      
      // Bu ana kategorinin alt kategorilerini de kaldır
      const mainCategory = hierarchicalCategories.find(cat => cat.id.toString() === categoryId);
      if (mainCategory) {
        const subCatsToRemove = mainCategory.subCategories.map(sub => sub.id.toString());
        const newSubCategories = selectedSubCategories.filter(id => !subCatsToRemove.includes(id));
        setSelectedSubCategories(newSubCategories);
        updateURL(newCategories, newSubCategories);
      } else {
        updateURL(newCategories, selectedSubCategories);
      }
    } else {
      // Ana kategori ekleniyor
      const newCategories = [...selectedCategories, categoryId];
      setSelectedCategories(newCategories);
      updateURL(newCategories, selectedSubCategories);
    }
  };

  // Multi-select alt kategori toggle
  const toggleSubCategory = (subCategoryId: string, parentCategoryId: string) => {
    const isCurrentlySelected = selectedSubCategories.includes(subCategoryId);
    
    if (isCurrentlySelected) {
      // Alt kategori kaldırılıyor
      const newSubCategories = selectedSubCategories.filter(id => id !== subCategoryId);
      setSelectedSubCategories(newSubCategories);
      updateURL(selectedCategories, newSubCategories);
    } else {
      // Alt kategori ekleniyor
      const newSubCategories = [...selectedSubCategories, subCategoryId];
      setSelectedSubCategories(newSubCategories);
      
      // Ana kategoriyi de otomatik ekle (eğer yoksa)
      let newCategories = selectedCategories;
      if (!selectedCategories.includes(parentCategoryId)) {
        newCategories = [...selectedCategories, parentCategoryId];
        setSelectedCategories(newCategories);
      }
      
      updateURL(newCategories, newSubCategories);
    }
  };

  // URL güncelleme helper
  const updateURL = (categories: string[], subCategories: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (categories.length > 0) {
      newParams.set('categoryIds', categories.join(','));
    } else {
      newParams.delete('categoryIds');
    }
    
    if (subCategories.length > 0) {
      newParams.set('subCategoryIds', subCategories.join(','));
    } else {
      newParams.delete('subCategoryIds');
    }
    
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Tek kategori kaldırma
  const removeSingleCategory = (categoryId: string, isSubCategory: boolean = false) => {
    if (isSubCategory) {
      // Alt kategori siliniyor
      const newSubCategories = selectedSubCategories.filter(id => id !== categoryId);
      setSelectedSubCategories(newSubCategories);
      updateURL(selectedCategories, newSubCategories);
    } else {
      // Ana kategori siliniyor
      const newCategories = selectedCategories.filter(id => id !== categoryId);
      setSelectedCategories(newCategories);
      
      // Bu ana kategorinin alt kategorilerini de sil
      const mainCategory = hierarchicalCategories.find(cat => cat.id.toString() === categoryId);
      if (mainCategory) {
        const subCatsToRemove = mainCategory.subCategories.map(sub => sub.id.toString());
        const newSubCategories = selectedSubCategories.filter(id => !subCatsToRemove.includes(id));
        setSelectedSubCategories(newSubCategories);
        updateURL(newCategories, newSubCategories);
      } else {
        updateURL(newCategories, selectedSubCategories);
      }
    }
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
    const newParams = new URLSearchParams(searchParams);
    if (gender) {
      newParams.set('gender', gender);
    } else {
      newParams.delete('gender');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sort);
    setSearchParams(newParams);
  };

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedGender('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
    setSearchParams({});
  };

  // Multi-Select Hierarchical Category Component
  const HierarchicalCategoryFilter = ({ isMobile = false }: { isMobile?: boolean }) => {
    const namePrefix = isMobile ? 'category-mobile' : 'category';
    
    return (
      <div className="space-y-2">
        {/* Tüm Kategoriler Seçeneği */}
        <label className="flex items-center">
          <input
            type="radio"
            name={namePrefix + '-all'}
            checked={selectedCategories.length === 0 && selectedSubCategories.length === 0}
            onChange={() => {
              setSelectedCategories([]);
              setSelectedSubCategories([]);
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('categoryIds');
              newParams.delete('subCategoryIds');
              newParams.delete('page');
              setSearchParams(newParams);
            }}
            className="mr-2 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm font-medium">Tüm Kategoriler</span>
        </label>

        {/* Ana Kategoriler ve Alt Kategoriler */}
        {hierarchicalCategories.map((mainCategory) => (
          <div key={mainCategory.id} className="space-y-1">
            {/* Ana Kategori - Multi-Select Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(mainCategory.id.toString())}
                  onChange={() => toggleMainCategory(mainCategory.id.toString())}
                  className="mr-2 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium">{mainCategory.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({mainCategory.subCategories.filter(sub => selectedSubCategories.includes(sub.id.toString())).length > 0 
                    ? `${mainCategory.subCategories.filter(sub => selectedSubCategories.includes(sub.id.toString())).length} alt kategori seçili`
                    : ''})
                </span>
              </label>

              {/* Alt kategoriler varsa expand/collapse butonu */}
              {mainCategory.subCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleCategoryExpansion(mainCategory.id)}
                  className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {expandedCategories.has(mainCategory.id) ? (
                    <FiChevronUp size={14} className="text-gray-500" />
                  ) : (
                    <FiChevronDown size={14} className="text-gray-500" />
                  )}
                </button>
              )}
            </div>

            {/* Alt Kategoriler - Multi-Select */}
            {mainCategory.subCategories.length > 0 && expandedCategories.has(mainCategory.id) && (
              <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-3">
                {mainCategory.subCategories.map((subCategory) => (
                  <label key={subCategory.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSubCategories.includes(subCategory.id.toString())}
                      onChange={() => toggleSubCategory(subCategory.id.toString(), mainCategory.id.toString())}
                      className="mr-2 text-orange-600 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">{subCategory.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex gap-4 lg:gap-8">
        {/* Desktop Filter Toggle Button */}
        <button
          onClick={() => setIsDesktopFilterOpen(!isDesktopFilterOpen)}
          className="hidden lg:flex fixed top-1/2 left-4 z-30 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300 transform -translate-y-1/2"
          style={{ left: isDesktopFilterOpen ? '280px' : '16px' }}
        >
          {isDesktopFilterOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>

        {/* Sidebar Filters - Desktop with Collapse */}
        <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          isDesktopFilterOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}>
          <div className={`bg-white rounded-lg shadow p-6 sticky top-24 transition-opacity duration-300 ${
            isDesktopFilterOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filtreler</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Temizle
              </button>
            </div>

            {/* Gender Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <span>Cinsiyet</span>
              </h3>
              <div className="space-y-2">
                {genderOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={selectedGender === option.value}
                      onChange={(e) => handleGenderChange(e.target.value)}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hierarchical Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <span>Kategoriler</span>
                {isLoadingHierarchical && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                )}
              </h3>
              <HierarchicalCategoryFilter />
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <span>Fiyat Aralığı</span>
              </h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  onClick={handlePriceFilter}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition text-sm"
                >
                  Fiyat Filtrele
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filtreler</h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Mobile Gender Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span>Cinsiyet</span>
                  </h3>
                  <div className="space-y-2">
                    {genderOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="gender-mobile"
                          value={option.value}
                          checked={selectedGender === option.value}
                          onChange={(e) => handleGenderChange(e.target.value)}
                          className="mr-2 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Hierarchical Category Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span>Kategoriler</span>
                    {isLoadingHierarchical && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                    )}
                  </h3>
                  <HierarchicalCategoryFilter isMobile={true} />
                </div>

                {/* Mobile Price Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span>Fiyat Aralığı</span>
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={() => {
                        handlePriceFilter();
                        setIsMobileFilterOpen(false);
                      }}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition text-sm"
                    >
                      Fiyat Filtrele
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${
          isDesktopFilterOpen ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex items-center gap-3">
                {/* Filter Toggle Button - Hem desktop hem mobile */}
                <button
                  onClick={() => {
                    // Desktop için
                    if (windowWidth >= 1024) {
                      setIsDesktopFilterOpen(!isDesktopFilterOpen);
                    } else {
                      // Mobile için
                      setIsMobileFilterOpen(true);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FiFilter size={16} />
                  <span className="text-sm">Filtreler</span>
                </button>
                
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                    {searchParams.get('sale') === 'true' ? 'İndirimli Ürünler' : 
                     searchParams.get('gender') ? `${searchParams.get('gender')} Ürünleri` : 'Ürünler'}
                  </h1>
                  {pagination && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {pagination.totalItems} ürün bulundu
                      {searchParams.get('sale') === 'true' && (
                        <span className="ml-2 text-red-600 font-medium">
                          • İndirimli ürünler
                        </span>
                      )}
                      {searchParams.get('gender') && (
                        <span className="ml-2 text-orange-600 font-medium">
                          • {searchParams.get('gender')} kategorisi
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border rounded-lg px-3 py-2 pr-8 text-xs sm:text-sm focus:outline-none focus:border-orange-500 min-w-0"
                >
                  <option value="name">İsme Göre (A-Z)</option>
                  <option value="price">Fiyata Göre (Düşük-Yüksek)</option>
                  <option value="price_desc">Fiyata Göre (Yüksek-Düşük)</option>
                  <option value="newest">En Yeniler</option>
                  <option value="popular">En Popülerler</option>
                  {searchParams.get('sale') === 'true' && (
                    <option value="discount">İndirim Yüzdesine Göre</option>
                  )}
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Basit ve Temiz Active Filters Display */}
            {(selectedGender || selectedCategories.length > 0 || selectedSubCategories.length > 0 || searchParams.get('search')) && (
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
                {/* Cinsiyet Filtresi */}
                {selectedGender && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                    {selectedGender}
                    <button
                      onClick={() => handleGenderChange('')}
                      className="ml-1 hover:text-orange-900"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                )}
                
                {/* Ana Kategoriler - Mavi */}
                {selectedCategories.map(categoryId => (
                  <span key={`main-${categoryId}`} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                    {getCategoryName(categoryId)}
                    <button
                      onClick={() => removeSingleCategory(categoryId, false)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
                
                {/* Alt Kategoriler - Mor */}
                {selectedSubCategories.map(subCategoryId => {
                  // Alt kategorinin ana kategorisini bul
                  let parentCategory = '';
                  for (const mainCat of hierarchicalCategories) {
                    if (mainCat.subCategories.some(sub => sub.id.toString() === subCategoryId)) {
                      parentCategory = mainCat.id.toString();
                      break;
                    }
                  }
                  
                  return (
                    <span key={`sub-${subCategoryId}`} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                      {getCategoryName(parentCategory, subCategoryId)}
                      <button
                        onClick={() => removeSingleCategory(subCategoryId, true)}
                        className="ml-1 hover:text-purple-900"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  );
                })}
                
                {/* Arama Filtresi */}
                {searchParams.get('search') && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                    "{searchParams.get('search')}"
                  </span>
                )}
                
                {/* Kategori Filtrelerini Temizle - Sadece kategori varsa */}
                {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedSubCategories([]);
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('categoryIds');
                      newParams.delete('subCategoryIds');
                      newParams.delete('page');
                      setSearchParams(newParams);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition"
                  >
                    Kategorileri Temizle
                  </button>
                )}
                
                {/* Tümünü Temizle */}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
              <p className="text-gray-500 text-base sm:text-lg">
                {searchParams.get('sale') === 'true' 
                  ? 'Şu anda indirimli ürün bulunmuyor' 
                  : searchParams.get('gender')
                  ? `${searchParams.get('gender')} kategorisinde ürün bulunamadı`
                  : 'Ürün bulunamadı'
                }
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-orange-600 hover:text-orange-700"
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <>
              {/* Mobil Optimize Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex flex-col items-center space-y-4">
                  <nav className="flex items-center space-x-1 sm:space-x-2">
                    {/* Önceki Button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-2 py-2 sm:px-3 sm:py-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1"
                    >
                      <FiChevronLeft size={16} />
                      <span className="hidden sm:inline">Önceki</span>
                    </button>

                    {/* Sayfa Numaraları - Dinamik */}
                    {(() => {
                      const currentPage = pagination.currentPage;
                      const totalPages = pagination.totalPages;
                      const pages = [];

                      // Mobile için basit gösterim (3 sayfa max)
                      if (windowWidth < 640) {
                        const start = Math.max(1, currentPage - 1);
                        const end = Math.min(totalPages, currentPage + 1);
                        
                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-2 rounded-lg text-xs ${
                                currentPage === i
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-white shadow hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                      } else {
                        // Desktop için gelişmiş gösterim
                        // İlk sayfa
                        if (currentPage > 3) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-white shadow hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          
                          if (currentPage > 4) {
                            pages.push(
                              <span key="start-ellipsis" className="px-2 py-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                        }

                        // Mevcut sayfa ve çevresindeki sayfalar
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(totalPages, currentPage + 2);

                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm ${
                                currentPage === i
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-white shadow hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Son sayfa
                        if (currentPage < totalPages - 2) {
                          if (currentPage < totalPages - 3) {
                            pages.push(
                              <span key="end-ellipsis" className="px-2 py-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-white shadow hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                      }

                      return pages;
                    })()}

                    {/* Sonraki Button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-2 py-2 sm:px-3 sm:py-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Sonraki</span>
                      <FiChevronRight size={16} />
                    </button>
                  </nav>

                  {/* Pagination Info */}
                  <div className="text-center text-xs sm:text-sm text-gray-600">
                    Sayfa {pagination.currentPage} / {pagination.totalPages} 
                    <span className="hidden sm:inline">
                      {" "}({pagination.totalItems} ürün)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;