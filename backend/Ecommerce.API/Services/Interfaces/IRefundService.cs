using ECommerce.API.Models;
using ECommerce.API.DTOs;

namespace ECommerce.API.Services.Interfaces
{
    public interface IRefundService
    {
        // 🆕 YENİ: Ürün bazlı iade sistemi
        Task<List<OrderItemForRefundDto>> GetOrderItemsForRefundAsync(int orderId, int userId);
        Task<RefundRequest> CreateRefundRequestWithItemsAsync(CreateRefundRequestDto dto, int userId);
        Task<RefundRequestDetailDto> GetRefundRequestDetailAsync(int refundId);

        // ✅ MEVCUT: Sipariş bazlı iade (eski sistem - korunuyor)
        Task<bool> CancelOrderAsync(int orderId, int userId, string reason, bool isAdmin = false);
        Task<RefundRequest> CreateRefundRequestAsync(int orderId, int userId, string reason, decimal? amount = null);
        Task<RefundRequest> ProcessRefundRequestAsync(int refundId, int adminUserId, bool approved, string? adminNotes = null);
        Task<IEnumerable<RefundRequest>> GetUserRefundRequestsAsync(int userId);
        Task<IEnumerable<RefundRequest>> GetAllRefundRequestsAsync();
        Task<bool> CanCancelOrderAsync(int orderId);
        Task<bool> CanRequestRefundAsync(int orderId);
    }
}