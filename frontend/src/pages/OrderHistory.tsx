import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState } from '../store';
import api from '../services/api';
import { Order, OrderStatus, OrderItemForRefund, RefundItemSelection } from '../types';

const FiPackage = Icons.FiPackage as any;
const FiCalendar = Icons.FiCalendar as any;
const FiTruck = Icons.FiTruck as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiEye = Icons.FiEye as any;
const FiAlertTriangle = Icons.FiAlertTriangle as any;
const FiArrowLeft = Icons.FiArrowLeft as any;
const FiMapPin = Icons.FiMapPin as any;
const FiCreditCard = Icons.FiCreditCard as any;

// Modal interfaces
interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderNumber: string;
  onSuccess: () => void;
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  onSuccess: () => void;
}

// Order Detail Modal Props
interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onProductClick: (productId: number) => void;
}

// Cancel Order Modal Component
const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await api.post('/refund/cancel-order', {
        orderId,
        reason: reason.trim()
      });
      
      alert('Sipariş başarıyla iptal edildi.');
      onSuccess();
      onClose();
      setReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Sipariş iptal edilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiAlertTriangle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold">Siparişi İptal Et</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          <strong>#{orderNumber}</strong> numaralı siparişinizi iptal etmek istediğinizden emin misiniz?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İptal Nedeni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="İptal nedeninizi açıklayın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Refund Request Modal Component (Simplified for space)
const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  totalAmount,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      // Simplified refund request
      await api.post('/refund/request', {
        orderId,
        reason: reason.trim()
      });
      
      alert('İade talebi başarıyla oluşturuldu.');
      onSuccess();
      onClose();
      setReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'İade talebi oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiRefreshCw className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold">İade Talebi</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          <strong>#{orderNumber}</strong> numaralı sipariş için iade talebi oluşturun.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İade Nedeni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="İade nedeninizi açıklayın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Oluşturuluyor...' : 'İade Talebi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order, onProductClick }) => {
  if (!isOpen) return null;

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return { text: 'Beklemede', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiPackage };
      case OrderStatus.Processing:
        return { text: 'İşleniyor', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FiRefreshCw };
      case OrderStatus.Shipped:
        return { text: 'Kargoda', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: FiTruck };
      case OrderStatus.Delivered:
        return { text: 'Teslim Edildi', color: 'text-green-600', bgColor: 'bg-green-100', icon: FiCheck };
      case OrderStatus.Cancelled:
        return { text: 'İptal Edildi', color: 'text-red-600', bgColor: 'bg-red-100', icon: FiX };
      case OrderStatus.Refunded:
        return { text: 'İade Edildi', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiRefreshCw };
      default:
        return { text: 'Bilinmiyor', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiPackage };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold">Sipariş Detayı</h2>
              <p className="text-gray-600">#{order.orderNumber}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
            <StatusIcon size={14} />
            {statusInfo.text}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sipariş Bilgileri */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiPackage className="text-orange-500" size={18} />
                  Sipariş Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sipariş No:</span>
                    <span className="font-medium">#{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarih:</span>
                    <span className="font-medium">{formatDate(order.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ürün Sayısı:</span>
                    <span className="font-medium">{order.orderItems.length} adet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                  </div>
                </div>
              </div>

              {/* Teslimat Adresi */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiMapPin className="text-green-500" size={18} />
                  Teslimat Adresi
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingFirstName} {order.shippingLastName}</p>
                  <p className="text-gray-600">{order.shippingAddress}</p>
                  <p className="text-gray-600">{order.shippingCity}, {order.shippingPostalCode}</p>
                  <p className="text-gray-600">{order.shippingPhone}</p>
                </div>
              </div>
            </div>

            {/* Sipariş Özeti */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FiCreditCard className="text-orange-500" size={18} />
                Sipariş Özeti
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Ara Toplam</p>
                  <p className="font-semibold text-sm">₺{(order.totalAmount - order.shippingCost - order.taxAmount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Kargo</p>
                  <p className="font-semibold text-sm">{order.shippingCost === 0 ? 'Ücretsiz' : `₺${order.shippingCost.toFixed(2)}`}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">KDV</p>
                  <p className="font-semibold text-sm">₺{order.taxAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Toplam</p>
                  <p className="font-bold text-base text-orange-600">₺{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Sipariş Detayı - Ürünler */}
            <div>
              <h3 className="font-semibold mb-4">Sipariş Detayı</h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition cursor-pointer"
                    onClick={() => onProductClick(item.productId)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Küçük Ürün Görseli */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0].imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiPackage size={16} />
                          </div>
                        )}
                      </div>

                      {/* Ürün Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                          {item.productName}
                        </h4>
                        
                        {/* Beden bilgisi */}
                        <div className="flex items-center gap-2 mb-2">
                          {item.productVariant && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {item.productVariant.sizeDisplay || item.productVariant.size}
                            </span>
                          )}
                          {!item.productVariant && item.selectedSize && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {item.selectedSize}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600">
                            {item.quantity} adet × ₺{item.unitPrice.toFixed(2)}
                          </p>
                          <p className="font-semibold text-sm text-orange-600">₺{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      <FiChevronRight className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<Order[]>('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return { text: 'Beklemede', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
      case OrderStatus.Processing:
        return { text: 'İşleniyor', color: 'text-blue-700', bgColor: 'bg-blue-100' };
      case OrderStatus.Shipped:
        return { text: 'Kargoda', color: 'text-purple-700', bgColor: 'bg-purple-100' };
      case OrderStatus.Delivered:
        return { text: 'Teslim Edildi', color: 'text-green-700', bgColor: 'bg-green-100' };
      case OrderStatus.Cancelled:
        return { text: 'İptal Edildi', color: 'text-red-700', bgColor: 'bg-red-100' };
      case OrderStatus.Refunded:
        return { text: 'İade Edildi', color: 'text-gray-700', bgColor: 'bg-gray-100' };
      default:
        return { text: 'Bilinmiyor', color: 'text-gray-700', bgColor: 'bg-gray-100' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle order detail
  const handleOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  // Handle cancel order
  const handleCancelOrder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  // Handle refund request
  const handleRefundRequest = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setRefundModalOpen(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchOrders();
  };

  // Handle product click in detail modal
  const handleProductClick = (productId: number) => {
    setDetailModalOpen(false);
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Henüz Siparişiniz Yok</h2>
            <p className="text-gray-600 mb-8">
              İlk siparişinizi verin ve burada görüntüleyin.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transform hover:scale-105 transition duration-300"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Siparişlerim</h1>
          <p className="text-gray-600">{orders.length} sipariş bulundu</p>
        </div>

        {/* Order Cards */}
        <div className="space-y-3">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const firstProduct = order.orderItems[0];

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => handleOrderDetail(order)}
              >
                <div className="p-3 md:p-6">
                  <div className="flex flex-col gap-3">
                    {/* Üst Kısım: Tarih + Durum + Fiyat */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FiCalendar className="text-gray-400" size={14} />
                          <span className="text-xs font-medium text-gray-900">
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                        <p className="text-base md:text-lg font-bold text-gray-900">₺{order.totalAmount.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                        <FiChevronRight className="text-gray-400" size={16} />
                      </div>
                    </div>

                    {/* Alt Kısım: Ürün + Bilgiler + Butonlar */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      {/* Küçük Ürün Görseli */}
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {firstProduct?.product?.images && firstProduct.product.images.length > 0 ? (
                          <img
                            src={firstProduct.product.images[0].imageUrl}
                            alt={firstProduct.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiPackage size={16} />
                          </div>
                        )}
                      </div>

                      {/* Sipariş Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-gray-900 mb-1 truncate">
                          #{order.orderNumber}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">
                          {order.orderItems.length} ürün
                          {order.orderItems.length === 1 && `, ${firstProduct.productName}`}
                          {order.orderItems.length > 1 && `, ${firstProduct.productName} ve +${order.orderItems.length - 1}`}
                        </p>
                      </div>

                      {/* Action Buttons - Mobilde dikey */}
                      <div className="flex flex-col md:flex-row gap-1 md:gap-2 flex-shrink-0">
                        {/* Cancel Order Button */}
                        {(order.status === OrderStatus.Pending || order.status === OrderStatus.Processing) && (
                          <button
                            onClick={(e) => handleCancelOrder(order, e)}
                            className="px-2 md:px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition whitespace-nowrap"
                          >
                            İptal
                          </button>
                        )}

                        {/* Refund Request Button */}
                        {(order.status === OrderStatus.Delivered || order.status === OrderStatus.Shipped) && !order.hasActiveRefundRequest && (
                          <button
                            onClick={(e) => handleRefundRequest(order, e)}
                            className="px-2 md:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition whitespace-nowrap"
                          >
                            İade
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <>
          <CancelOrderModal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            orderId={selectedOrder.id}
            orderNumber={selectedOrder.orderNumber}
            onSuccess={handleModalSuccess}
          />
          
          <RefundRequestModal
            isOpen={refundModalOpen}
            onClose={() => setRefundModalOpen(false)}
            orderId={selectedOrder.id}
            orderNumber={selectedOrder.orderNumber}
            totalAmount={selectedOrder.totalAmount}
            onSuccess={handleModalSuccess}
          />

          <OrderDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            order={selectedOrder}
            onProductClick={handleProductClick}
          />
        </>
      )}
    </div>
  );
};

export default OrderHistory;