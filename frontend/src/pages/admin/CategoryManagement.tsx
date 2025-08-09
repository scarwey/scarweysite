import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiGrid = Icons.FiGrid as any;
const FiPlus = Icons.FiPlus as any;
const FiEdit = Icons.FiEdit as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiSearch = Icons.FiSearch as any;
const FiX = Icons.FiX as any;
const FiSave = Icons.FiSave as any;
const FiAlertTriangle = Icons.FiAlertTriangle as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiAlertCircle = Icons.FiAlertCircle as any;

interface Category {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subCategories?: Category[];
  products?: any[];
}

interface CategoryFormData {
  name: string;
  description: string;
  parentCategoryId: number | null;
  isActive: boolean;
}

// 🆕 Delete bilgi interface'i
interface DeleteInfo {
  categoryId: number;
  categoryName: string;
  directProductCount: number;
  subCategoryCount: number;
  subCategoryProductCount: number;
  totalProductCount: number;
  canDelete: boolean;
  warning?: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // 🆕 Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
  const [loadingDeleteInfo, setLoadingDeleteInfo] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentCategoryId: null,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await api.get<Category[]>('/categories/admin/all');
        console.log('Admin API Response:', response.data);
        setCategories(response.data);
      } catch (adminError) {
        const response = await api.get<Category[]>('/categories');
        console.log('Fallback API Response:', response.data);
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.response?.data?.message || 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchCategories(true);
  };

  // 🆕 Delete bilgilerini getir
  const fetchDeleteInfo = async (categoryId: number): Promise<DeleteInfo | null> => {
    try {
      setLoadingDeleteInfo(true);
      const response = await api.get<DeleteInfo>(`/categories/${categoryId}/delete-info`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching delete info:', error);
      setError('Silme bilgileri alınırken hata oluştu');
      return null;
    } finally {
      setLoadingDeleteInfo(false);
    }
  };

  // 🆕 Delete modal'ını aç
  const openDeleteModal = async (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
    setConfirmText('');
    
    const info = await fetchDeleteInfo(category.id);
    if (info) {
      setDeleteInfo(info);
    }
  };

  // 🆕 Delete modal'ını kapat
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
    setDeleteInfo(null);
    setConfirmText('');
  };

  // 🆕 Kategori silme işlemi
  const handleDeleteConfirm = async () => {
    if (!deletingCategory || !deleteInfo) return;
    
    // Konfirmasyon metni kontrolü
    const expectedText = deleteInfo.totalProductCount > 0 
      ? `SİL ${deleteInfo.categoryName}` 
      : deleteInfo.categoryName;
    
    if (confirmText !== expectedText) {
      setError(`Lütfen "${expectedText}" yazın`);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      console.log('🔥 Deleting category:', deletingCategory.name, 'ID:', deletingCategory.id);
      
      const response = await api.delete(`/categories/${deletingCategory.id}`);
      
      console.log('✅ Delete response:', response.data);
      
      // Local state'ten kaldır
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== deletingCategory.id)
      );
      
      closeDeleteModal();
      
      // Başarı mesajı göster
      const successMessage = deleteInfo.totalProductCount > 0 
        ? `"${deletingCategory.name}" kategorisi ve ${deleteInfo.totalProductCount} ürün kalıcı olarak silindi.`
        : `"${deletingCategory.name}" kategorisi kalıcı olarak silindi.`;
      
      // Success toast göstermek için bir state ekleyebilirsiniz
      console.log('✅ Success:', successMessage);
      
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      setError(error.response?.data?.message || 'Kategori silinirken hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parentCategoryId: category.parentCategoryId || null,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parentCategoryId: null,
        isActive: true,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentCategoryId: null,
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Kategori adı en az 2 karakter olmalıdır';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Açıklama 500 karakterden fazla olamaz';
    }

    if (formData.parentCategoryId && editingCategory) {
      const isCircular = checkCircularReference(editingCategory.id, formData.parentCategoryId);
      if (isCircular) {
        errors.parentCategoryId = 'Döngüsel referans oluşturulamaz';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkCircularReference = (categoryId: number, parentId: number): boolean => {
    if (categoryId === parentId) return true;
    
    const findParentChain = (id: number): boolean => {
      const category = categories.find(c => c.id === id);
      if (!category) return false;
      if (category.parentCategoryId === categoryId) return true;
      if (category.parentCategoryId != null) {
        return findParentChain(category.parentCategoryId);
      }
      return false;
    };

    return findParentChain(parentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      if (editingCategory) {
        console.log('Updating category with data:', { ...categoryData, id: editingCategory.id });
        
        const response = await api.put(`/categories/${editingCategory.id}`, {
          ...categoryData,
          id: editingCategory.id,
        });
        
        console.log('Update response:', response);
        
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingCategory.id 
              ? { ...cat, ...categoryData, id: editingCategory.id, updatedAt: new Date().toISOString() }
              : cat
          )
        );
        
      } else {
        const response = await api.post('/categories', categoryData);
        setCategories(prevCategories => [...prevCategories, response.data]);
      }

      closeModal();
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Kategori kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && category.isActive === true) ||
      (statusFilter === 'inactive' && category.isActive === false);
    
    return matchesSearch && matchesStatus;
  });

  const getParentCategoryName = (parentId: number | null | undefined): string => {
    if (!parentId) return 'Ana Kategori';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Bilinmeyen';
  };

  const renderCategoryRow = (category: Category, level = 0) => {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ marginLeft: level * 20 }}>
              {hasSubCategories && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>
              )}
              <div className="flex items-center">
                <FiGrid className="text-purple-600 mr-3" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">{category.description}</div>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {getParentCategoryName(category.parentCategoryId)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category.products?.length || 0} ürün
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(category.createdAt).toLocaleDateString('tr-TR')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex space-x-2">
              <button
                onClick={() => openModal(category)}
                className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded"
                title="Düzenle"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={() => openDeleteModal(category)}
                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                title="Kalıcı Sil"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        
        {hasSubCategories && isExpanded && category.subCategories!.map(subCategory => 
          renderCategoryRow(subCategory, level + 1)
        )}
      </React.Fragment>
    );
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Güncelleniyor...' : 'Yenile'}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <FiPlus />
            Yeni Kategori
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pasif
              </button>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-lg text-purple-600">{categories.length}</div>
              <div>Toplam</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">
                {categories.filter(c => c.isActive).length}
              </div>
              <div>Aktif</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-red-600">
                {categories.filter(c => !c.isActive).length}
              </div>
              <div>Pasif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiGrid className="mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">Kategori bulunamadı</h3>
            <p>
              {searchQuery 
                ? 'Arama kriterlerinize uygun kategori bulunamadı.' 
                : 'Henüz kategori bulunmuyor. İlk kategorinizi ekleyin.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Üst Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map(category => renderCategoryRow(category))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🆕 DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b bg-red-50">
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-red-800">
                  ⚠️ Kategori Kalıcı Silme Onayı
                </h3>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeleting}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {loadingDeleteInfo ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <span className="ml-3 text-gray-600">Bilgiler kontrol ediliyor...</span>
                </div>
              ) : deleteInfo ? (
                <div className="space-y-4">
                  {/* Ana uyarı mesajı */}
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                    <div className="flex items-start">
                      <FiAlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">
                          Bu işlem geri alınamaz!
                        </h4>
                        <p className="text-red-700 text-sm">
                          <strong>"{deleteInfo.categoryName}"</strong> kategorisi kalıcı olarak silinecektir.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Etkilenecek içerik bilgileri */}
                  {deleteInfo.totalProductCount > 0 && (
                    <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                      <h5 className="font-semibold text-orange-800 mb-2">
                        🗑️ Silinecek İçerikler:
                      </h5>
                      <ul className="text-orange-700 text-sm space-y-1">
                        {deleteInfo.directProductCount > 0 && (
                          <li>• <strong>{deleteInfo.directProductCount}</strong> adet ürün (bu kategoride)</li>
                        )}
                        {deleteInfo.subCategoryCount > 0 && (
                          <li>• <strong>{deleteInfo.subCategoryCount}</strong> adet alt kategori</li>
                        )}
                        {deleteInfo.subCategoryProductCount > 0 && (
                          <li>• <strong>{deleteInfo.subCategoryProductCount}</strong> adet ürün (alt kategorilerde)</li>
                        )}
                        <li className="font-semibold border-t border-orange-300 pt-2 mt-2">
                          TOPLAM: <strong>{deleteInfo.totalProductCount}</strong> ürün silinecek!
                        </li>
                      </ul>
                    </div>
                  )}

                  {deleteInfo.totalProductCount === 0 && deleteInfo.subCategoryCount > 0 && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>{deleteInfo.subCategoryCount}</strong> alt kategori silinecek.
                      </p>
                    </div>
                  )}

                  {deleteInfo.totalProductCount === 0 && deleteInfo.subCategoryCount === 0 && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                      <p className="text-green-800 text-sm">
                        ✅ Bu kategori boş. Herhangi bir ürün veya alt kategori etkilenmeyecek.
                      </p>
                    </div>
                  )}

                  {/* Konfirmasyon input */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Silme işlemini onaylamak için aşağıdaki metni yazın:
                    </label>
                    <div className="bg-gray-100 rounded p-3 border">
                      <code className="text-red-600 font-mono font-bold">
                        {deleteInfo.totalProductCount > 0 
                          ? `SİL ${deleteInfo.categoryName}` 
                          : deleteInfo.categoryName
                        }
                      </code>
                    </div>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Yukarıdaki metni buraya yazın..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={isDeleting}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      disabled={isDeleting}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting || confirmText !== (deleteInfo.totalProductCount > 0 ? `SİL ${deleteInfo.categoryName}` : deleteInfo.categoryName)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Siliniyor...
                        </>
                      ) : (
                        <>
                          <FiTrash2 />
                          Kalıcı Olarak Sil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <FiAlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                  <p>Silme bilgileri alınamadı. Lütfen tekrar deneyin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT/CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori adını girin"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori açıklaması (isteğe bağlı)"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Üst Kategori
                </label>
                <select
                  value={formData.parentCategoryId || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    parentCategoryId: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.parentCategoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Ana Kategori</option>
                  {categories
                    .filter(c => !editingCategory || c.id !== editingCategory.id)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
                {formErrors.parentCategoryId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.parentCategoryId}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Aktif kategori
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave />
                  )}
                  {saving ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;