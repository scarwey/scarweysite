import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';
import { Category } from '../../types';

const FiChevronDown = Icons.FiChevronDown as any;
const FiLoader = Icons.FiLoader as any;

interface CategorySelectorProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  error?: string;
  disabled?: boolean;
  mainCategories: Category[]; // Ana kategorileri parent'tan alacağız
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategoryChange,
  error,
  disabled = false,
  mainCategories
}) => {
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Component mount'ta mevcut seçimi ayarla
  useEffect(() => {
    if (selectedCategoryId && mainCategories.length > 0) {
      setExistingSelection(selectedCategoryId);
    } else {
      resetSelection();
    }
  }, [selectedCategoryId, mainCategories]);

  // Ana kategori değiştiğinde alt kategorileri yükle
  useEffect(() => {
    if (selectedMainCategory) {
      fetchSubCategories(selectedMainCategory);
    } else {
      setSubCategories([]);
      setSelectedSubCategory(null);
    }
  }, [selectedMainCategory]);

  const resetSelection = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSubCategories([]);
  };

  const fetchSubCategories = async (parentId: number) => {
    try {
      setLoadingSubCategories(true);
      const response = await api.get<Category[]>(`/categories/${parentId}/subcategories`);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Alt kategoriler yüklenirken hata:', error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  // Mevcut seçimi ayarlama (edit mode için)
  const setExistingSelection = async (categoryId: number) => {
    try {
      // Önce ana kategorilerde ara
      const isMainCategory = mainCategories.find(cat => cat.id === categoryId);
      
      if (isMainCategory) {
        // Ana kategori seçili
        setSelectedMainCategory(categoryId);
        setSelectedSubCategory(null);
        return;
      }

      // Alt kategori olabilir, API'den kategori detayını al
      const response = await api.get<Category>(`/categories/${categoryId}`);
      const selectedCategory = response.data;

      if (selectedCategory.parentCategoryId) {
        // Alt kategori seçili - ana kategoriyi de ayarla
        setSelectedMainCategory(selectedCategory.parentCategoryId);
        setSelectedSubCategory(categoryId);
      } else {
        // API'den gelen ama ana kategorilerde olmayan kategori
        setSelectedMainCategory(categoryId);
        setSelectedSubCategory(null);
      }
    } catch (error) {
      console.error('Mevcut kategori seçimi ayarlanırken hata:', error);
      // Hata durumunda sadece ana kategori olarak ayarla
      setSelectedMainCategory(categoryId);
      setSelectedSubCategory(null);
    }
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mainCategoryId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedMainCategory(mainCategoryId);
    setSelectedSubCategory(null);

    // Ana kategori seçildiyse bunu parent'a bildir
    onCategoryChange(mainCategoryId);
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subCategoryId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedSubCategory(subCategoryId);

    // Alt kategori seçildiyse onu, yoksa ana kategoriyi parent'a bildir
    if (subCategoryId) {
      onCategoryChange(subCategoryId);
    } else if (selectedMainCategory) {
      onCategoryChange(selectedMainCategory);
    }
  };

  // Ana kategorileri filtrele (sadece parentCategoryId undefined/null olanlar)
  const filteredMainCategories = mainCategories.filter(category => 
    !category.parentCategoryId // undefined veya null olanlar
  );

  return (
    <div className="space-y-3">
      {/* Ana Kategori Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ana Kategori <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedMainCategory || ''}
            onChange={handleMainCategoryChange}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Ana kategori seçin</option>
            {filteredMainCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Alt Kategori Seçimi */}
      {selectedMainCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alt Kategori <span className="text-gray-400">(İsteğe bağlı)</span>
          </label>
          <div className="relative">
            <select
              value={selectedSubCategory || ''}
              onChange={handleSubCategoryChange}
              disabled={disabled || loadingSubCategories}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled || loadingSubCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingSubCategories ? 'Alt kategoriler yükleniyor...' : 'Alt kategori seçin (isteğe bağlı)'}
              </option>
              {subCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {loadingSubCategories ? (
              <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={16} />
            ) : (
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            )}
          </div>
          
          {subCategories.length === 0 && !loadingSubCategories && selectedMainCategory && (
            <p className="text-sm text-gray-500 mt-1">
              Bu ana kategoriye ait alt kategori bulunmuyor
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Info Text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p><strong>💡 Nasıl çalışır:</strong></p>
        <p>• Önce ana kategoriyi seçin (örn: Ayakkabı)</p>
        <p>• Sonra alt kategori seçebilirsiniz (örn: Spor Ayakkabı)</p>
        <p>• Alt kategori seçilmezse ürün ana kategoriye atanır</p>
      </div>
    </div>
  );
};

export default CategorySelector;