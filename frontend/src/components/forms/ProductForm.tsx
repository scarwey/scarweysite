import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';
import { Product, Category, ProductVariant } from '../../types';
import CategorySelector from './CategorySelector';

const FiX = Icons.FiX as any;
const FiSave = Icons.FiSave as any;
const FiPlus = Icons.FiPlus as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiCheck = Icons.FiCheck as any;
const FiEdit3 = Icons.FiEdit3 as any;

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  brand: string;
  categoryId: number;
  isFeatured: boolean;
  isActive: boolean;
  // 🆕 YENİ ALANLAR
  gender?: string;
  hasSizes: boolean;
}

interface ProductVariantFormData {
  size: string;
  sizeDisplay: string;
  stockQuantity: number;
  priceModifier: number;
  isAvailable: boolean;
  sortOrder: number;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingProduct?: Product | null;
  categories: Category[];
  userRole?: 'admin' | 'seller';
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  categories,
  userRole = 'admin'
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    discountPrice: undefined,
    stockQuantity: 0,
    sku: '',
    brand: '',
    categoryId: 0,
    isFeatured: false,
    isActive: true,
    gender: '',
    hasSizes: false,
  });

  const [variants, setVariants] = useState<ProductVariantFormData[]>([]);
  const [newVariant, setNewVariant] = useState<ProductVariantFormData>({
    size: '',
    sizeDisplay: '',
    stockQuantity: 0,
    priceModifier: 0,
    isAvailable: true,
    sortOrder: 0,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'variants'>('basic');

  // 🆕 Gender seçenekleri
  const genderOptions = [
    { value: '', label: 'Cinsiyet seçin' },
    { value: 'Erkek', label: 'Erkek' },
    { value: 'Kadın', label: 'Kadın' },
    { value: 'Uniseks', label: 'Uniseks' },
    { value: 'Çocuk', label: 'Çocuk' }
  ];

  // 🆕 Hazır beden seçenekleri
  const sizePresets = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    shoes_male: ['39', '40', '41', '42', '43', '44', '45', '46'],
    shoes_female: ['35', '36', '37', '38', '39', '40', '41', '42'],
    kids: ['2-3 Yaş', '4-5 Yaş', '6-7 Yaş', '8-9 Yaş', '10-11 Yaş', '12-13 Yaş']
  };

  // Form verilerini doldur
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        discountPrice: editingProduct.discountPrice,
        stockQuantity: editingProduct.stockQuantity,
        sku: editingProduct.sku,
        brand: editingProduct.brand,
        categoryId: editingProduct.categoryId,
        isFeatured: editingProduct.isFeatured,
        isActive: editingProduct.isActive,
        gender: editingProduct.gender || '',
        hasSizes: editingProduct.hasSizes || false,
      });

      // Mevcut variant'ları yükle
      if (editingProduct.hasSizes && editingProduct.variants) {
        const variantData = editingProduct.variants.map(v => ({
          size: v.size,
          sizeDisplay: v.sizeDisplay || '',
          stockQuantity: v.stockQuantity,
          priceModifier: v.priceModifier || 0,
          isAvailable: v.isAvailable,
          sortOrder: v.sortOrder,
        }));
        setVariants(variantData);
      } else {
        setVariants([]);
      }
    } else {
      // Yeni ürün için temiz form
      setFormData({
        name: '',
        description: '',
        price: 0,
        discountPrice: undefined,
        stockQuantity: 0,
        sku: '',
        brand: '',
        categoryId: categories[0]?.id || 0,
        isFeatured: false,
        isActive: true,
        gender: '',
        hasSizes: false,
      });
      setVariants([]);
    }

    setFormErrors({});
    setNewVariant({
      size: '',
      sizeDisplay: '',
      stockQuantity: 0,
      priceModifier: 0,
      isAvailable: true,
      sortOrder: 0,
    });
    setActiveTab('basic');
  }, [editingProduct, categories, isOpen]);

  // 🆕 Beden ekleme
  const handleAddVariant = () => {
    if (!newVariant.size.trim()) {
      setFormErrors({ ...formErrors, variantSize: 'Beden girişi gereklidir' });
      return;
    }

    if (variants.some(v => v.size === newVariant.size)) {
      setFormErrors({ ...formErrors, variantSize: 'Bu beden zaten mevcut' });
      return;
    }

    const variant: ProductVariantFormData = {
      ...newVariant,
      sizeDisplay: newVariant.sizeDisplay || newVariant.size,
      sortOrder: variants.length,
    };

    setVariants([...variants, variant]);
    setNewVariant({
      size: '',
      sizeDisplay: '',
      stockQuantity: 0,
      priceModifier: 0,
      isAvailable: true,
      sortOrder: 0,
    });

    const { variantSize, ...otherErrors } = formErrors;
    setFormErrors(otherErrors);
  };

  // 🆕 Beden silme
  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    const updatedVariants = newVariants.map((v, i) => ({ ...v, sortOrder: i }));
    setVariants(updatedVariants);
  };

  // 🆕 Beden güncelleme
  const handleUpdateVariant = (index: number, field: keyof ProductVariantFormData, value: any) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  };

  // 🆕 Hazır beden setlerini ekle
  const handleAddPresetSizes = (preset: keyof typeof sizePresets) => {
    const sizes = sizePresets[preset];
    const newVariants = sizes.map((size, index) => ({
      size,
      sizeDisplay: size,
      stockQuantity: 0,
      priceModifier: 0,
      isAvailable: true,
      sortOrder: variants.length + index,
    }));

    const uniqueVariants = newVariants.filter(newV =>
      !variants.some(existingV => existingV.size === newV.size)
    );

    setVariants([...variants, ...uniqueVariants]);
  };

  // 🆕 Toplam stok hesapla
  const calculateTotalStock = () => {
    if (formData.hasSizes) {
      return variants.filter(v => v.isAvailable).reduce((total, v) => total + v.stockQuantity, 0);
    }
    return formData.stockQuantity;
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Ürün adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Ürün adı en az 2 karakter olmalıdır';
    }

    if (!formData.description.trim()) {
      errors.description = 'Ürün açıklaması gereklidir';
    }

    if (formData.price <= 0) {
      errors.price = 'Fiyat 0\'dan büyük olmalıdır';
    }

    if (formData.discountPrice && formData.discountPrice < 0) {
      errors.discountPrice = 'İndirimli fiyat negatif olamaz';
    }

    if (formData.discountPrice && formData.discountPrice >= formData.price) {
      errors.discountPrice = 'İndirimli fiyat normal fiyattan küçük olmalıdır';
    }

    if (!formData.hasSizes && formData.stockQuantity < 0) {
      errors.stockQuantity = 'Stok miktarı negatif olamaz';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU gereklidir';
    }

    if (!formData.brand.trim()) {
      errors.brand = 'Marka gereklidir';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Kategori seçimi gereklidir';
    }

    if (formData.hasSizes) {
      if (variants.length === 0) {
        errors.variants = 'En az bir beden eklemelisiniz';
        setActiveTab('variants');
      } else {
        const invalidVariants = variants.filter(v => v.isAvailable && v.stockQuantity < 0);
        if (invalidVariants.length > 0) {
          errors.variantStock = 'Beden stok miktarları negatif olamaz';
          setActiveTab('variants');
        }
      }
    }

    setFormErrors(errors);

    const basicErrors = ['name', 'description', 'price', 'discountPrice', 'stockQuantity', 'sku', 'brand', 'categoryId'];
    const hasBasicErrors = basicErrors.some(field => errors[field]);
    if (hasBasicErrors && activeTab !== 'basic') {
      setActiveTab('basic');
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        brand: formData.brand.trim(),
        gender: formData.gender || null,
        discountPrice: formData.discountPrice && formData.discountPrice > 0 ? formData.discountPrice : null,
        stockQuantity: formData.hasSizes ? calculateTotalStock() : formData.stockQuantity,
      };

      let savedProduct: Product;
      let productId: number;

      const baseUrl = userRole === 'admin' ? '/products' : '/seller/products';

      if (editingProduct) {
        const response = await api.put(`${baseUrl}/${editingProduct.id}`, {
          ...productData,
          id: editingProduct.id,
        });

        savedProduct = response.data || editingProduct;
        productId = editingProduct.id;

        console.log('✅ Product updated, ID:', productId);
      } else {
        const response = await api.post(baseUrl, productData);
        savedProduct = response.data;
        productId = savedProduct.id;

        console.log('✅ Product created, ID:', productId);
      }

      // 🆕 GÜNCELLENMIŞ VARIANT YÖNETIMI
      if (formData.hasSizes && variants.length > 0) {
        console.log('🔧 Processing variants for product ID:', productId);

        // Önce mevcut variant'ları sil (düzenleme durumunda)
        if (editingProduct && editingProduct.variants) {
          console.log('🗑️ Deleting existing variants:', editingProduct.variants.length);

          // Her variant'ı tek tek sil ve sonucu logla
          const deletePromises = editingProduct.variants.map(async (variant, index) => {
            try {
              console.log(`🗑️ [${index + 1}/${editingProduct.variants!.length}] Deleting variant:`, {
                id: variant.id,
                size: variant.size,
                productId: variant.productId
              });

              await api.delete(`/products/variants/${variant.id}`);
              console.log(`✅ [${index + 1}] Deleted variant:`, variant.size);
              return { success: true, variant };
            } catch (error: any) {
              console.error(`❌ [${index + 1}] Variant silme hatası:`, {
                variantId: variant.id,
                size: variant.size,
                error: error.response?.data || error.message
              });
              return { success: false, variant, error };
            }
          });

          // Tüm silme işlemlerinin tamamlanmasını bekle
          const deleteResults = await Promise.all(deletePromises);
          const successCount = deleteResults.filter(result => result.success).length;
          const failCount = deleteResults.filter(result => !result.success).length;

          console.log(`📊 Variant silme sonucu: ${successCount} başarılı, ${failCount} başarısız`);

          if (failCount > 0) {
            console.warn('⚠️ Bazı variantlar silinemedi, devam ediliyor...');
            deleteResults
              .filter(result => !result.success)
              .forEach(result => {
                console.warn('⚠️ Silinemedi:', result.variant.size, result.error);
              });
          }

          // Database işleminin tamamlanması için bekle
          console.log('⏳ Database işlemi için 1 saniye bekleniyor...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Yeni variant'ları ekle
        console.log('➕ Adding new variants:', variants.length);
        const addResults = [];

        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          if (variant.isAvailable) {
            try {
              // Backend ProductVariant model'ine uygun format
              const variantData = {
                Size: variant.size,
                SizeDisplay: variant.sizeDisplay || variant.size,
                StockQuantity: variant.stockQuantity,
                PriceModifier: variant.priceModifier || 0,
                IsAvailable: variant.isAvailable,
                SortOrder: variant.sortOrder,
                IsActive: true,
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString()
              };

              console.log(`➕ [${i + 1}/${variants.length}] Adding variant:`, variant.size);
              console.log('📤 Variant data:', JSON.stringify(variantData, null, 2));

              const variantResponse = await api.post(`/products/${productId}/variants`, variantData);

              console.log(`✅ [${i + 1}] SUCCESS - Added variant:`, variant.size);
              console.log('📥 Response:', variantResponse.data);

              addResults.push({ success: true, variant, response: variantResponse.data });

            } catch (error: any) {
              console.error(`❌ [${i + 1}] VARIANT EKLEME HATASI:`, variant.size);
              console.error('🔍 Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                url: `/products/${productId}/variants`
              });

              addResults.push({ success: false, variant, error: error.response?.data });

              // 400 hatası ise alternatif format dene
              if (error.response?.status === 400) {
                console.log(`🔄 [${i + 1}] Trying alternative camelCase format for:`, variant.size);
                try {
                  const altData = {
                    size: variant.size,
                    sizeDisplay: variant.sizeDisplay || variant.size,
                    stockQuantity: variant.stockQuantity,
                    priceModifier: variant.priceModifier || 0,
                    isAvailable: variant.isAvailable,
                    sortOrder: variant.sortOrder,
                  };

                  console.log('📤 Alternative data:', JSON.stringify(altData, null, 2));
                  const altResponse = await api.post(`/products/${productId}/variants`, altData);

                  console.log(`✅ [${i + 1}] SUCCESS via alternative format:`, variant.size);
                  addResults[addResults.length - 1] = { success: true, variant, response: altResponse.data };

                } catch (altError: any) {
                  console.error(`❌ [${i + 1}] Alternative format de başarısız:`, variant.size);
                  console.error('🔍 Alt Error:', altError.response?.data);
                }
              }

              console.warn(`⚠️ [${i + 1}] Bu variant başarısız, devam ediliyor...`);
            }
          } else {
            console.log(`⏭️ [${i + 1}] Skipping inactive variant:`, variant.size);
          }
        }

        // Sonuçları özetle
        const addSuccessCount = addResults.filter(r => r.success).length;
        const addFailCount = addResults.filter(r => !r.success).length;

        console.log(`📊 Variant ekleme sonucu: ${addSuccessCount} başarılı, ${addFailCount} başarısız`);

        if (addFailCount > 0) {
          console.warn('⚠️ Başarısız variantlar:');
          addResults
            .filter(r => !r.success)
            .forEach(r => console.warn('  -', r.variant.size, r.error));
        }

      } else if (editingProduct && editingProduct.hasSizes && !formData.hasSizes) {
        // Eğer ürün bedensiz yapılıyorsa, mevcut variant'ları sil
        console.log('🗑️ Product changed to non-sized, deleting variants');
        if (editingProduct.variants) {
          for (const variant of editingProduct.variants) {
            try {
              await api.delete(`/products/variants/${variant.id}`);
            } catch (error) {
              console.warn('Variant silme hatası:', error);
            }
          }
        }
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Ürün kaydedilirken hata oluştu'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'basic'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Temel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'variants'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Beden Yönetimi
              {formData.hasSizes && variants.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {variants.filter(v => v.isAvailable).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Submit Error */}
          {formErrors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <FiAlertCircle className="text-red-500 mr-3" />
              <span className="text-red-700">{formErrors.submit}</span>
            </div>
          )}

          {/* Global Validation Errors */}
          {Object.keys(formErrors).length > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FiAlertCircle className="text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">Lütfen aşağıdaki hataları düzeltin:</span>
              </div>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                {Object.entries(formErrors).map(([field, message]) => (
                  <li key={field}>
                    {field === 'variants' || field === 'variantStock' ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('variants')}
                        className="underline hover:text-yellow-900"
                      >
                        {message} (Beden Yönetimi'ne git)
                      </button>
                    ) : field === 'submit' ? null : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className="underline hover:text-yellow-900"
                      >
                        {message} (Temel Bilgiler'e git)
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Ürün adını girin"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Ürün açıklaması"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İndirimli Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountPrice || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      discountPrice: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.discountPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="İsteğe bağlı"
                  />
                  {formErrors.discountPrice && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.discountPrice}</p>
                  )}
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet
                  </label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Müşteriler bu bilgiyle filtreleme yapabilir
                  </p>
                </div>

                {/* Has Sizes Checkbox */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beden Seçenekleri
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasSizes"
                      checked={formData.hasSizes}
                      onChange={(e) => {
                        setFormData({ ...formData, hasSizes: e.target.checked });
                        if (!e.target.checked) {
                          setVariants([]);
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasSizes" className="ml-2 block text-sm text-gray-700">
                      Bu ürünün beden seçenekleri var
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.hasSizes
                      ? 'Beden Yönetimi sekmesinden bedenleri ekleyebilirsiniz'
                      : 'Sadece genel stok miktarı kullanılacak'
                    }
                  </p>
                </div>

                {/* Stock Quantity - Sadece beden yoksa görünür */}
                {!formData.hasSizes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Miktarı *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="0"
                    />
                    {formErrors.stockQuantity && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.stockQuantity}</p>
                    )}
                  </div>
                )}

                {/* Total Stock Display - Sadece beden varsa görünür */}
                {formData.hasSizes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Toplam Stok
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      <span className="text-gray-700 font-medium">{calculateTotalStock()} adet</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Beden stokları toplamı otomatik hesaplanır
                      </p>
                    </div>
                  </div>
                )}

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.sku ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Ürün kodu"
                  />
                  {formErrors.sku && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.brand ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Marka adı"
                  />
                  {formErrors.brand && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.brand}</p>
                  )}
                </div>

                {/* Category - New Hierarchical Selector */}
                <CategorySelector
                  selectedCategoryId={formData.categoryId}
                  onCategoryChange={(categoryId) => {
                    setFormData({ ...formData, categoryId: categoryId || 0 });
                    // Error'u temizle
                    if (formErrors.categoryId) {
                      setFormErrors({ ...formErrors, categoryId: '' });
                    }
                  }}
                  error={formErrors.categoryId}
                  disabled={saving}
                  mainCategories={categories}
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Aktif ürün
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    Öne çıkan ürün
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Variant Management Tab */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {!formData.hasSizes ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Beden Yönetimi Devre Dışı</h3>
                  <p className="text-gray-500 mb-4">
                    Beden yönetimi için önce "Temel Bilgiler" sekmesinden "Bu ürünün beden seçenekleri var" seçeneğini işaretleyin.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    Temel Bilgilere Git
                  </button>
                </div>
              ) : (
                <>
                  {/* Preset Size Buttons */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Hazır Beden Setleri</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddPresetSizes('clothing')}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        👕 Giyim (XS-XXXL)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetSizes('shoes_male')}
                        className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition text-sm"
                      >
                        👞 Erkek Ayakkabı (39-46)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetSizes('shoes_female')}
                        className="bg-pink-100 text-pink-700 px-3 py-2 rounded-lg hover:bg-pink-200 transition text-sm"
                      >
                        👠 Kadın Ayakkabı (35-42)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetSizes('kids')}
                        className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition text-sm"
                      >
                        👶 Çocuk (2-13 Yaş)
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Hazır setler mevcut bedenlerinize eklenir, duplikasyon olmaz.
                    </p>
                  </div>

                  {/* Add New Variant */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Yeni Beden Ekle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Beden *
                        </label>
                        <input
                          type="text"
                          value={newVariant.size}
                          onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.variantSize ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="M, L, 42, vs."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Görünen İsim
                        </label>
                        <input
                          type="text"
                          value={newVariant.sizeDisplay}
                          onChange={(e) => setNewVariant({ ...newVariant, sizeDisplay: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Medium, Large, vs."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Stok
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newVariant.stockQuantity}
                          onChange={(e) => setNewVariant({ ...newVariant, stockQuantity: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Fiyat Farkı (₺)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newVariant.priceModifier}
                          onChange={(e) => setNewVariant({ ...newVariant, priceModifier: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1 text-sm"
                        >
                          <FiPlus size={16} />
                          Ekle
                        </button>
                      </div>
                    </div>
                    {formErrors.variantSize && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.variantSize}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Fiyat farkı: Ana fiyata eklenecek/çıkarılacak tutar (örn: +10.00 veya -5.00)
                    </p>
                  </div>

                  {/* Variants List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">
                        Bedenler ({variants.filter(v => v.isAvailable).length} aktif)
                      </h4>
                      {variants.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Toplam Stok: <span className="font-medium">{calculateTotalStock()}</span>
                        </div>
                      )}
                    </div>

                    {formErrors.variants && (
                      <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                        <FiAlertCircle className="text-red-500 mr-2" size={16} />
                        <span className="text-red-700 text-sm">{formErrors.variants}</span>
                      </div>
                    )}

                    {variants.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-gray-500">
                          <p className="font-medium mb-1">Henüz beden eklenmemiş</p>
                          <p className="text-sm">Yukarıdaki form ile beden ekleyebilir veya hazır setleri kullanabilirsiniz.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {variants.map((variant, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg ${variant.isAvailable ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
                              }`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Beden</label>
                                <input
                                  type="text"
                                  value={variant.size}
                                  onChange={(e) => handleUpdateVariant(index, 'size', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Görünen İsim</label>
                                <input
                                  type="text"
                                  value={variant.sizeDisplay}
                                  onChange={(e) => handleUpdateVariant(index, 'sizeDisplay', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Stok</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.stockQuantity}
                                  onChange={(e) => handleUpdateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Fiyat Farkı</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={variant.priceModifier}
                                  onChange={(e) => handleUpdateVariant(index, 'priceModifier', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Durum</label>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={variant.isAvailable}
                                    onChange={(e) => handleUpdateVariant(index, 'isAvailable', e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-xs text-gray-600">Aktif</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">İşlem</label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(index)}
                                  className="w-full bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition text-sm flex items-center justify-center gap-1"
                                >
                                  <FiTrash2 size={14} />
                                  Sil
                                </button>
                              </div>
                            </div>

                            {/* Variant Summary */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>
                                  Final Fiyat: <strong>₺{(formData.price + variant.priceModifier).toFixed(2)}</strong>
                                </span>
                                <span>
                                  Sıra: {variant.sortOrder + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formErrors.variantStock && (
                      <p className="text-red-500 text-sm mt-2">{formErrors.variantStock}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSave />
              )}
              {saving ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;