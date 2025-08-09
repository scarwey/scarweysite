using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;
using ECommerce.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class RefundService : IRefundService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public RefundService(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId, string reason, bool isAdmin = false)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return false;

            // İptal edilebilir mi kontrol et
            if (!await CanCancelOrderAsync(orderId)) return false;

            // Kullanıcı yetkisi kontrol et (admin değilse sadece kendi siparişini iptal edebilir)
            if (!isAdmin && order.UserId != userId) return false;

            // Siparişi iptal et
            order.Status = OrderStatus.Cancelled;
            order.CancellationReason = reason;
            order.CancellationDate = DateTime.UtcNow;
            order.CancelledByUserId = userId;

            // Stokları geri ekle
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();

            foreach (var item in orderItems)
            {
                if (item.Product != null)
                {
                    item.Product.StockQuantity += item.Quantity;
                }
            }

            await _context.SaveChangesAsync();

            // Email gönder
            await _emailService.SendOrderCancellationEmailAsync(order.User!.Email!, order.OrderNumber, reason);

            return true;
        }

        public async Task<RefundRequest> CreateRefundRequestAsync(int orderId, int userId, string reason, decimal? amount = null)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) throw new ArgumentException("Sipariş bulunamadı");
            if (order.UserId != userId) throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok");
            if (!await CanRequestRefundAsync(orderId)) throw new InvalidOperationException("Bu sipariş için iade talebi oluşturulamaz");

            // Iade miktarını belirle
            var refundAmount = amount ?? order.TotalAmount;
            var refundType = (amount.HasValue && amount.Value < order.TotalAmount) ? RefundType.Partial : RefundType.Full;

            var refundRequest = new RefundRequest
            {
                OrderId = orderId,
                Status = RefundStatus.Pending,
                Reason = reason,
                RefundAmount = refundAmount,
                RequestedByUserId = userId,
                Type = refundType
            };

            _context.RefundRequests.Add(refundRequest);
            await _context.SaveChangesAsync();

            // Admin'e email gönder
            var adminEmail = _configuration["EmailSettings:AdminEmail"];
            await _emailService.SendRefundRequestNotificationToAdminAsync(order.OrderNumber, reason, refundAmount);

            return refundRequest;
        }

        public async Task<RefundRequest> ProcessRefundRequestAsync(int refundId, int adminUserId, bool approved, string? adminNotes = null)
        {
            var refundRequest = await _context.RefundRequests
                .Include(rr => rr.Order)
                .ThenInclude(o => o.User)
                .Include(rr => rr.RequestedBy)
                .FirstOrDefaultAsync(rr => rr.Id == refundId);

            if (refundRequest == null) throw new ArgumentException("İade talebi bulunamadı");
            if (refundRequest.Status != RefundStatus.Pending) throw new InvalidOperationException("Bu iade talebi zaten işlenmiş");

            refundRequest.Status = approved ? RefundStatus.Approved : RefundStatus.Rejected;
            refundRequest.ProcessedByUserId = adminUserId;
            refundRequest.ProcessedDate = DateTime.UtcNow;
            refundRequest.AdminNotes = adminNotes;

            if (approved)
            {
                // Sipariş durumunu güncelle
                refundRequest.Order.Status = OrderStatus.Refunded;

                // Stokları geri ekle (eğer tam iade ise)
                if (refundRequest.Type == RefundType.Full)
                {
                    var orderItems = await _context.OrderItems
                        .Include(oi => oi.Product)
                        .Where(oi => oi.OrderId == refundRequest.OrderId)
                        .ToListAsync();

                    foreach (var item in orderItems)
                    {
                        if (item.Product != null)
                        {
                            item.Product.StockQuantity += item.Quantity;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Müşteriye email gönder
            await _emailService.SendRefundProcessedEmailAsync(
                refundRequest.RequestedBy.Email!,
                refundRequest.Order.OrderNumber,
                approved,
                refundRequest.RefundAmount,
                adminNotes);

            return refundRequest;
        }

        public async Task<IEnumerable<RefundRequest>> GetUserRefundRequestsAsync(int userId)
        {
            return await _context.RefundRequests
                .Include(rr => rr.Order)
                .Include(rr => rr.ProcessedBy)
                .Where(rr => rr.RequestedByUserId == userId)
                .OrderByDescending(rr => rr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<RefundRequest>> GetAllRefundRequestsAsync()
        {
            return await _context.RefundRequests
                .Include(rr => rr.Order)
                .Include(rr => rr.RequestedBy)
                .Include(rr => rr.ProcessedBy)
                .OrderByDescending(rr => rr.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> CanCancelOrderAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            // Sadece Pending, Processing durumundaki siparişler iptal edilebilir
            return order.Status == OrderStatus.Pending || order.Status == OrderStatus.Processing;
        }

        public async Task<bool> CanRequestRefundAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            // YENİ: Shipped + Delivered
            if (order.Status != OrderStatus.Delivered && order.Status != OrderStatus.Shipped)
                return false;

            var existingRefund = await _context.RefundRequests
                .AnyAsync(rr => rr.OrderId == orderId && rr.Status != RefundStatus.Rejected);

            return !existingRefund;
        }

        // 🆕 YENİ METODLAR - ÜRÜN BAZLI İADE SİSTEMİ

        public async Task<List<OrderItemForRefundDto>> GetOrderItemsForRefundAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems!)
                    .ThenInclude(oi => oi.Product!)
                        .ThenInclude(p => p.Images)
                .Include(o => o.OrderItems!)
                    .ThenInclude(oi => oi.ProductVariant)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) throw new ArgumentException("Sipariş bulunamadı");
            if (order.UserId != userId) throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok");

            // Daha önce iade edilen ürünleri al
            var existingRefundItems = await _context.RefundItems
                .Where(ri => ri.RefundRequest.OrderId == orderId)
                .GroupBy(ri => ri.OrderItemId)
                .Select(g => new { OrderItemId = g.Key, RefundedQuantity = g.Sum(x => x.Quantity) })
                .ToListAsync();

            var result = new List<OrderItemForRefundDto>();

            foreach (var orderItem in order.OrderItems ?? new List<OrderItem>())
            {
                var alreadyRefunded = existingRefundItems
                    .FirstOrDefault(x => x.OrderItemId == orderItem.Id)?.RefundedQuantity ?? 0;

                var availableQuantity = orderItem.Quantity - alreadyRefunded;

                result.Add(new OrderItemForRefundDto
                {
                    Id = orderItem.Id,
                    ProductName = orderItem.ProductName,
                    ProductImage = orderItem.Product?.Images?.FirstOrDefault()?.ImageUrl,
                    Size = orderItem.ProductVariant?.SizeDisplay ?? orderItem.SelectedSize,
                    Quantity = orderItem.Quantity,
                    UnitPrice = orderItem.UnitPrice,
                    TotalPrice = orderItem.TotalPrice,
                    CanRefund = availableQuantity > 0,
                    AlreadyRefundedQuantity = alreadyRefunded
                });
            }

            return result;
        }

        public async Task<RefundRequest> CreateRefundRequestWithItemsAsync(CreateRefundRequestDto dto, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems!)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

            if (order == null) throw new ArgumentException("Sipariş bulunamadı");
            if (order.UserId != userId) throw new UnauthorizedAccessException("Bu siparişe erişim yetkiniz yok");
            if (!await CanRequestRefundAsync(dto.OrderId)) throw new InvalidOperationException("Bu sipariş için iade talebi oluşturulamaz");

            if (dto.Items == null || !dto.Items.Any())
                throw new ArgumentException("En az bir ürün seçmelisiniz");

            // Toplam iade tutarını hesapla
            var totalRefundAmount = dto.Items.Sum(x => x.RefundAmount);
            var refundType = totalRefundAmount >= order.TotalAmount ? RefundType.Full : RefundType.Partial;

            // RefundRequest oluştur
            var refundRequest = new RefundRequest
            {
                OrderId = dto.OrderId,
                Status = RefundStatus.Pending,
                Reason = dto.GeneralReason,
                RefundAmount = totalRefundAmount,
                RequestedByUserId = userId,
                Type = refundType
            };

            _context.RefundRequests.Add(refundRequest);
            await _context.SaveChangesAsync(); // ID'yi almak için save

            // RefundItem'ları oluştur
            foreach (var itemDto in dto.Items)
            {
                // OrderItem validation
                var orderItem = order.OrderItems?.FirstOrDefault(oi => oi.Id == itemDto.OrderItemId);
                if (orderItem == null) throw new ArgumentException($"OrderItem {itemDto.OrderItemId} bulunamadı");

                // Miktar kontrolü
                if (itemDto.Quantity <= 0 || itemDto.Quantity > orderItem.Quantity)
                    throw new ArgumentException($"Geçersiz miktar: {itemDto.Quantity}");

                var refundItem = new RefundItem
                {
                    RefundRequestId = refundRequest.Id,
                    OrderItemId = itemDto.OrderItemId,
                    Quantity = itemDto.Quantity,
                    Reason = itemDto.Reason,
                    RefundAmount = itemDto.RefundAmount
                };

                _context.RefundItems.Add(refundItem);
            }

            await _context.SaveChangesAsync();

            // Admin'e email gönder
            await _emailService.SendRefundRequestNotificationToAdminAsync(order.OrderNumber, dto.GeneralReason, totalRefundAmount);

            return refundRequest;
        }

        public async Task<RefundRequestDetailDto> GetRefundRequestDetailAsync(int refundId)
        {
            var refundRequest = await _context.RefundRequests
                .Include(rr => rr.Order)
                .Include(rr => rr.RequestedBy)
                .Include(rr => rr.ProcessedBy)
                .Include(rr => rr.RefundItems!)
                    .ThenInclude(ri => ri.OrderItem)
                        .ThenInclude(oi => oi.Product!)
                            .ThenInclude(p => p.Images)
                .Include(rr => rr.RefundItems!)
                    .ThenInclude(ri => ri.OrderItem)
                        .ThenInclude(oi => oi.ProductVariant)
                .FirstOrDefaultAsync(rr => rr.Id == refundId);

            if (refundRequest == null) throw new ArgumentException("İade talebi bulunamadı");

            var result = new RefundRequestDetailDto
            {
                Id = refundRequest.Id,
                OrderId = refundRequest.OrderId,
                OrderNumber = refundRequest.Order.OrderNumber,
                CustomerName = $"{refundRequest.RequestedBy?.FirstName} {refundRequest.RequestedBy?.LastName}",
                CustomerEmail = refundRequest.RequestedBy?.Email ?? "",
                Status = refundRequest.Status.ToString(),
                GeneralReason = refundRequest.Reason,
                TotalRefundAmount = refundRequest.RefundAmount,
                Type = refundRequest.Type.ToString(),
                RequestDate = refundRequest.CreatedAt,
                ProcessedBy = refundRequest.ProcessedBy?.Email,
                ProcessedDate = refundRequest.ProcessedDate,
                AdminNotes = refundRequest.AdminNotes,
                RefundItems = refundRequest.RefundItems?.Select(ri => new RefundItemDetailDto
                {
                    Id = ri.Id,
                    OrderItemId = ri.OrderItemId,
                    ProductName = ri.OrderItem.ProductName,
                    ProductImage = ri.OrderItem.Product?.Images?.FirstOrDefault()?.ImageUrl,
                    Size = ri.OrderItem.ProductVariant?.SizeDisplay ?? ri.OrderItem.SelectedSize,
                    Quantity = ri.Quantity,
                    MaxQuantity = ri.OrderItem.Quantity,
                    UnitPrice = ri.OrderItem.UnitPrice,
                    RefundAmount = ri.RefundAmount,
                    Reason = ri.Reason
                }).ToList() ?? new List<RefundItemDetailDto>()
            };

            return result;
        }
    }
}