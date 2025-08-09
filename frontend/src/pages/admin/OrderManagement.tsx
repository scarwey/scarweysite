import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';
import { OrderStatus, AdminOrdersResponse, AdminOrder } from '../../types';

const FiShoppingBag = Icons.FiShoppingBag as any;
const FiSearch = Icons.FiSearch as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiX = Icons.FiX as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiCalendar = Icons.FiCalendar as any;
const FiDollarSign = Icons.FiDollarSign as any;
const FiUser = Icons.FiUser as any;
const FiEye = Icons.FiEye as any;
const FiEdit = Icons.FiEdit as any;
const FiPackage = Icons.FiPackage as any;
const FiTruck = Icons.FiTruck as any;
const FiCheck = Icons.FiCheck as any;
const FiXCircle = Icons.FiXCircle as any;
const FiMapPin = Icons.FiMapPin as any;
const FiPhone = Icons.FiPhone as any;

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const pageSize = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, startDate, endDate]);

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter.toString());
      }
      if (startDate) {
        params.append('startDate', new Date(startDate).toISOString());
      }
      if (endDate) {
        params.append('endDate', new Date(endDate).toISOString());
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await api.get<AdminOrdersResponse>(`/admin/orders?${params}`);
      
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    // Fetch without filters
    setTimeout(() => fetchOrders(), 100);
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    if (!window.confirm(`Sipariş durumunu değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }

    setUpdatingStatus(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

    } catch (error: any) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Sipariş durumu değiştirilirken hata oluştu');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openDetailModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      [OrderStatus.Pending]: { color: 'bg-yellow-100 text-yellow-800', text: 'Beklemede', icon: FiPackage },
      [OrderStatus.Processing]: { color: 'bg-blue-100 text-blue-800', text: 'İşleniyor', icon: FiEdit },
      [OrderStatus.Shipped]: { color: 'bg-purple-100 text-purple-800', text: 'Kargoda', icon: FiTruck },
      [OrderStatus.Delivered]: { color: 'bg-green-100 text-green-800', text: 'Teslim Edildi', icon: FiCheck },
      [OrderStatus.Cancelled]: { color: 'bg-red-100 text-red-800', text: 'İptal', icon: FiXCircle },
      [OrderStatus.Refunded]: { color: 'bg-gray-100 text-gray-800', text: 'İade', icon: FiXCircle },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${config.color}`}>
        <IconComponent size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case OrderStatus.Pending:
        return [OrderStatus.Processing, OrderStatus.Cancelled];
      case OrderStatus.Processing:
        return [OrderStatus.Shipped, OrderStatus.Cancelled];
      case OrderStatus.Shipped:
        return [OrderStatus.Delivered];
      case OrderStatus.Delivered:
        return [OrderStatus.Refunded];
      default:
        return [];
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusFilterCount = (status: OrderStatus | 'all') => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
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
        <h1 className="text-2xl font-bold text-gray-800">Sipariş Yönetimi</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Güncelleniyor...' : 'Yenile'}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="space-y-4">
          {/* Search Row */}
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sipariş no, müşteri ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <FiSearch size={16} />
                Ara
              </button>
            </form>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              title="Filtreleri Temizle"
            >
              <FiX size={16} />
              Temizle
            </button>
          </div>

          {/* Date Filters Row */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 min-w-0">Tarih Aralığı:</label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Status Filters Row */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-700' },
              { value: OrderStatus.Pending, label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
              { value: OrderStatus.Processing, label: 'İşleniyor', color: 'bg-blue-100 text-blue-700' },
              { value: OrderStatus.Shipped, label: 'Kargoda', color: 'bg-purple-100 text-purple-700' },
              { value: OrderStatus.Delivered, label: 'Teslim', color: 'bg-green-100 text-green-700' },
              { value: OrderStatus.Cancelled, label: 'İptal', color: 'bg-red-100 text-red-700' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === filter.value
                    ? 'bg-purple-600 text-white'
                    : `${filter.color} hover:bg-gray-200`
                }`}
              >
                {filter.label} ({getStatusFilterCount(filter.value as any)})
              </button>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex justify-end gap-6 pt-4 border-t text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-lg text-purple-600">{totalItems}</div>
              <div>Toplam Sipariş</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">
                {formatCurrency(
                  orders
                    .filter(order => order.status !== OrderStatus.Cancelled && order.status !== OrderStatus.Refunded)
                    .reduce((sum, order) => sum + order.totalAmount, 0)
                )}
              </div>
              <div>Net Tutar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiShoppingBag className="mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">Sipariş bulunamadı</h3>
            <p>
              {searchQuery || statusFilter !== 'all' || startDate || endDate
                ? 'Arama kriterlerinize uygun sipariş bulunamadı.' 
                : 'Henüz sipariş bulunmuyor.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teslimat Adresi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <FiShoppingBag className="text-purple-600" size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{order.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <FiUser className="text-gray-600" size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="flex items-center font-medium">
                            <FiMapPin className="text-gray-400 mr-1" size={12} />
                            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName || 'Adres bilgisi yok'}
                          </div>
                          <div className="text-gray-500 truncate" title={order.shippingAddress?.fullAddress}>
                            {order.shippingAddress?.city}, {order.shippingAddress?.country || 'Şehir bilgisi yok'}
                          </div>
                          {order.shippingAddress?.phone && (
                            <div className="text-xs text-gray-400 flex items-center">
                              <FiPhone className="mr-1" size={10} />
                              {order.shippingAddress.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar size={14} className="mr-2 text-gray-400" />
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiPackage size={14} className="mr-2 text-gray-400" />
                          {order.itemCount} ürün
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiDollarSign size={14} className="mr-1 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(order)}
                            className="text-purple-600 hover:text-purple-700 p-2 hover:bg-purple-50 rounded-lg transition"
                            title="Detayları Görüntüle"
                          >
                            <FiEye size={16} />
                          </button>
                          
                          {/* Status Change Button */}
                          {getAvailableStatuses(order.status).length > 0 && (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, parseInt(e.target.value) as OrderStatus)}
                              disabled={updatingStatus === order.id}
                              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            >
                              <option value={order.status}>{getStatusBadge(order.status).props.children[1]}</option>
                              {getAvailableStatuses(order.status).map(status => (
                                <option key={status} value={status}>
                                  {getStatusBadge(status).props.children[1]}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span>
                    {' '}arası, toplam{' '}
                    <span className="font-medium">{totalItems}</span> sipariş
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                    >
                      <FiChevronLeft className="mr-1" size={16} />
                      Önceki
                    </button>
                    
                    <div className="flex space-x-1">
                      {/* Show page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page:any;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium border rounded-lg ${
                              currentPage === page
                                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                    >
                      Sonraki
                      <FiChevronRight className="ml-1" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal - 🆕 BEDEN BİLGİSİ EKLENDİ */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Sipariş Detayları - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sipariş Bilgileri</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Sipariş Numarası</label>
                      <p className="font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Sipariş Tarihi</label>
                      <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Durum</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Ödeme Yöntemi</label>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Müşteri Bilgileri</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Ad Soyad</label>
                      <p className="font-medium">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium">{selectedOrder.customer.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Teslimat Adresi</h4>
                  <div className="space-y-3">
                    {selectedOrder.shippingAddress ? (
                      <>
                        <div>
                          <label className="text-sm text-gray-500">Alıcı</label>
                          <p className="font-medium">
                            {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Telefon</label>
                          <p className="font-medium">{selectedOrder.shippingAddress.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Adres</label>
                          <p className="font-medium">{selectedOrder.shippingAddress.fullAddress}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Şehir</label>
                          <p className="font-medium">
                            {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Ülke</label>
                          <p className="font-medium">{selectedOrder.shippingAddress.country}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">Adres bilgisi bulunamadı</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sipariş Özeti</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiPackage className="text-blue-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm text-blue-600">Ürün Sayısı</p>
                        <p className="text-lg font-semibold text-blue-800">{selectedOrder.itemCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiDollarSign className="text-green-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm text-green-600">Toplam Tutar</p>
                        <p className="text-lg font-semibold text-green-800">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiCalendar className="text-purple-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm text-purple-600">Sipariş Tarihi</p>
                        <p className="text-lg font-semibold text-purple-800">
                          {new Date(selectedOrder.orderDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🆕 Order Items with Size Information */}
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Sipariş Ürünleri</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beden</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adet</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {item.product?.images && item.product.images.length > 0 && (
                                  <img 
                                    src={item.product.images[0].imageUrl} 
                                    alt={item.productName}
                                    className="w-10 h-10 rounded-lg object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.productName || `Ürün #${item.productId}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {/* 🆕 BEDEN BİLGİSİ KOLONU */}
                              {item.productVariant ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium inline-flex items-center w-fit">
                                    📏 {item.productVariant.sizeDisplay || item.productVariant.size}
                                  </span>
                                  {item.productVariant.priceModifier != null && item.productVariant.priceModifier !== 0 && (
                                    <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                                      item.productVariant.priceModifier > 0 
                                        ? 'bg-orange-100 text-orange-700' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {item.productVariant.priceModifier > 0 ? '+' : ''}₺{item.productVariant.priceModifier.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ) : item.selectedSize ? (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  📏 {item.selectedSize}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Beden yok</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Kapat
                </button>
                
                {getAvailableStatuses(selectedOrder.status).length > 0 && (
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = parseInt(e.target.value) as OrderStatus;
                      handleStatusChange(selectedOrder.id, newStatus);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition border-0 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={selectedOrder.status}>Mevcut: {getStatusBadge(selectedOrder.status).props.children[1]}</option>
                    {getAvailableStatuses(selectedOrder.status).map(status => (
                      <option key={status} value={status} className="text-black">
                        Değiştir: {getStatusBadge(status).props.children[1]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;