import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiRefreshCw = Icons.FiRefreshCw as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiClock = Icons.FiClock as any;
const FiUser = Icons.FiUser as any;
const FiCalendar = Icons.FiCalendar as any;
const FiDollarSign = Icons.FiDollarSign as any;
const FiEye = Icons.FiEye as any;
const FiFilter = Icons.FiFilter as any;
const FiPackage = Icons.FiPackage as any;

// Types
interface RefundRequest {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  reason: string;
  refundAmount: number;
  type: 'Full' | 'Partial';
  requestDate: string;
  processedBy?: string;
  processedDate?: string;
  adminNotes?: string;
}

// 🆕 YENİ: Detaylı iade talebi tipi
interface RefundRequestDetail {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  generalReason: string;
  totalRefundAmount: number;
  type: string;
  requestDate: string;
  processedBy?: string;
  processedDate?: string;
  adminNotes?: string;
  refundItems: RefundItemDetail[];
}

interface RefundItemDetail {
  id: number;
  orderItemId: number;
  productName: string;
  productImage?: string;
  size?: string;
  quantity: number;
  maxQuantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundRequest: RefundRequest | null;
  onSuccess: () => void;
}

// 🆕 YENİ: Detay Modal
interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundRequestId: number | null;
}

// Detail Modal Component
const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  refundRequestId
}) => {
  const [loading, setLoading] = useState(false);
  const [refundDetail, setRefundDetail] = useState<RefundRequestDetail | null>(null);

  useEffect(() => {
    if (isOpen && refundRequestId) {
      fetchRefundDetail();
    }
  }, [isOpen, refundRequestId]);

  const fetchRefundDetail = async () => {
    if (!refundRequestId) return;
    
    setLoading(true);
    try {
      const response = await api.get<RefundRequestDetail>(`/refund/admin/detail/${refundRequestId}`);
      setRefundDetail(response.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Detay bilgileri yüklenirken hata oluştu.');
      console.error('Error fetching refund detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">İade Talebi Detayları</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Detaylar yükleniyor...</p>
            </div>
          ) : refundDetail ? (
            <div className="space-y-6">
              {/* Genel Bilgiler */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Genel Bilgiler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sipariş No</label>
                    <p className="font-semibold">#{refundDetail.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Müşteri</label>
                    <p className="font-semibold">{refundDetail.customerName}</p>
                    <p className="text-sm text-gray-600">{refundDetail.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Durum</label>
                    <p className="font-semibold">{refundDetail.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Toplam İade Tutarı</label>
                    <p className="font-semibold text-green-600">₺{refundDetail.totalRefundAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">İade Türü</label>
                    <p className="font-semibold">{refundDetail.type === 'Full' ? 'Tam İade' : 'Kısmi İade'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tarih</label>
                    <p className="font-semibold">{new Date(refundDetail.requestDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                
                {/* Genel Sebep */}
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Genel İade Nedeni</label>
                  <p className="text-gray-800 bg-white p-3 rounded border mt-1">{refundDetail.generalReason}</p>
                </div>

                {/* Admin Notları */}
                {refundDetail.adminNotes && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Admin Notları</label>
                    <p className="text-gray-800 bg-white p-3 rounded border mt-1">{refundDetail.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* İade Edilen Ürünler */}
              <div>
                <h4 className="font-semibold text-lg mb-4">İade Edilen Ürünler ({refundDetail.refundItems.length})</h4>
                <div className="space-y-4">
                  {refundDetail.refundItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiPackage size={20} />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.productName}</h5>
                          {item.size && (
                            <p className="text-sm text-gray-600">Beden: {item.size}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-gray-600">İade Miktarı:</span>
                              <p className="font-medium">{item.quantity} / {item.maxQuantity}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Birim Fiyat:</span>
                              <p className="font-medium">₺{item.unitPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">İade Tutarı:</span>
                              <p className="font-medium text-green-600">₺{item.refundAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">İade Nedeni:</span>
                              <p className="font-medium">{item.reason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* İade Özeti */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-3">İade Özeti</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Toplam Ürün:</span>
                    <p className="font-semibold">{refundDetail.refundItems.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Toplam Miktar:</span>
                    <p className="font-semibold">{refundDetail.refundItems.reduce((sum, item) => sum + item.quantity, 0)} adet</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Toplam Tutar:</span>
                    <p className="font-semibold text-blue-600">₺{refundDetail.totalRefundAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Detay bilgileri yüklenemedi.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Process Refund Modal
const ProcessRefundModal: React.FC<ProcessModalProps> = ({
  isOpen,
  onClose,
  refundRequest,
  onSuccess
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAction('approve');
      setAdminNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundRequest) return;

    setLoading(true);
    try {
      await api.post(`/refund/admin/process/${refundRequest.id}`, {
        approved: action === 'approve',
        adminNotes: adminNotes.trim() || null
      });
      
      alert(`İade talebi ${action === 'approve' ? 'onaylandı' : 'reddedildi'}.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !refundRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">İade Talebini İşle</h3>
        
        {/* Refund Request Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Sipariş No</label>
              <p className="font-semibold">#{refundRequest.orderNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Müşteri</label>
              <p className="font-semibold">{refundRequest.customerName}</p>
              <p className="text-sm text-gray-600">{refundRequest.customerEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">İade Miktarı</label>
              <p className="font-semibold text-green-600">₺{refundRequest.refundAmount.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">İade Türü</label>
              <p className="font-semibold">{refundRequest.type === 'Full' ? 'Tam İade' : 'Kısmi İade'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">İade Nedeni</label>
              <p className="text-gray-800 bg-white p-3 rounded border">{refundRequest.reason}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Action Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İşlem
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="approve"
                  checked={action === 'approve'}
                  onChange={(e) => setAction(e.target.value as 'approve')}
                  className="mr-2 text-green-600"
                  disabled={loading}
                />
                <span className="flex items-center gap-2 text-green-600">
                  <FiCheck size={16} />
                  İade Talebini Onayla
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="reject"
                  checked={action === 'reject'}
                  onChange={(e) => setAction(e.target.value as 'reject')}
                  className="mr-2 text-red-600"
                  disabled={loading}
                />
                <span className="flex items-center gap-2 text-red-600">
                  <FiX size={16} />
                  İade Talebini Reddet
                </span>
              </label>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notu {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={
                action === 'approve' 
                  ? "İsteğe bağlı not (örn: İade 3-5 iş günü içinde hesabınıza yansıyacaktır.)" 
                  : "Red nedeni (zorunlu)"
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              rows={3}
              required={action === 'reject'}
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
              İptal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={loading || (action === 'reject' && !adminNotes.trim())}
            >
              {loading ? 'İşleniyor...' : (action === 'approve' ? 'Onayla' : 'Reddet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminRefundManagement: React.FC = () => {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get<RefundRequest[]>('/refund/admin/all-requests');
      setRefundRequests(response.data);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      alert('İade talepleri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending':
        return { text: 'Beklemede', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiClock };
      case 'Approved':
        return { text: 'Onaylandı', color: 'text-green-600', bgColor: 'bg-green-100', icon: FiCheck };
      case 'Rejected':
        return { text: 'Reddedildi', color: 'text-red-600', bgColor: 'bg-red-100', icon: FiX };
      case 'Completed':
        return { text: 'Tamamlandı', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FiCheck };
      default:
        return { text: 'Bilinmiyor', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiClock };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProcessRequest = (request: RefundRequest) => {
    setSelectedRequest(request);
    setProcessModalOpen(true);
  };

  // 🆕 YENİ: Detay modal handler
  const handleViewDetail = (refundId: number) => {
    setSelectedRefundId(refundId);
    setDetailModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchRefundRequests();
  };

  const filteredRequests = refundRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const stats = {
    total: refundRequests.length,
    pending: refundRequests.filter(r => r.status === 'Pending').length,
    approved: refundRequests.filter(r => r.status === 'Approved').length,
    rejected: refundRequests.filter(r => r.status === 'Rejected').length,
    totalAmount: refundRequests
      .filter(r => r.status === 'Approved' || r.status === 'Completed')
      .reduce((sum, r) => sum + r.refundAmount, 0)
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">İade Yönetimi</h1>
        <button
          onClick={fetchRefundRequests}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <FiRefreshCw size={16} />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Talep</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiRefreshCw className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Beklemede</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FiClock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <FiCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reddedilen</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <FiX className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam İade</p>
              <p className="text-2xl font-bold text-blue-600">₺{stats.totalAmount.toFixed(0)}</p>
            </div>
            <FiDollarSign className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Durum:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
            <option value="completed">Tamamlandı</option>
          </select>
          <span className="text-sm text-gray-600">
            {filteredRequests.length} talep gösteriliyor
          </span>
        </div>
      </div>

      {/* Refund Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <FiRefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">İade talebi bulunamadı</h3>
            <p className="text-gray-500">Seçilen filtreye uygun iade talebi yoktur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş / Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İade Bilgisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const statusInfo = getStatusInfo(request.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{request.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiUser size={12} />
                            {request.customerName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {request.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ₺{request.refundAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.type === 'Full' ? 'Tam İade' : 'Kısmi İade'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon size={12} />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FiCalendar size={12} />
                          {formatDate(request.requestDate)}
                        </div>
                        {request.processedDate && (
                          <div className="text-xs text-gray-500">
                            İşlendi: {formatDate(request.processedDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {request.status === 'Pending' && (
                            <button
                              onClick={() => handleProcessRequest(request)}
                              className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                            >
                              <FiEye size={14} />
                              İşle
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetail(request.id)}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                          >
                            <FiEye size={14} />
                            Detay
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Modal */}
      <ProcessRefundModal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        refundRequest={selectedRequest}
        onSuccess={handleModalSuccess}
      />

      {/* 🆕 YENİ: Detail Modal */}
      <DetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        refundRequestId={selectedRefundId}
      />
    </div>
  );
};

export default AdminRefundManagement;