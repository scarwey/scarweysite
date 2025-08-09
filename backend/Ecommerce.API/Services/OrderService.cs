using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;
#pragma warning disable CS8620
namespace ECommerce.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;
        private readonly IEmailService _emailService;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
        {
            try
            {
                // ✅ NULL-SAFE THENINCLUDE (Satır 25 uyarıları düzeltildi)
                return await _context.Orders
                    .Include(o => o.OrderItems!)
                        .ThenInclude(oi => oi.Product!)
                            .ThenInclude(p => p.Images!)
                    .Include(o => o.OrderItems!)
                        .ThenInclude(oi => oi.ProductVariant!)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId, int userId)
        {
            try
            {
                // ✅ NULL-SAFE THENINCLUDE (Satır 46 uyarıları düzeltildi)
                return await _context.Orders
                    .Include(o => o.OrderItems!)
                        .ThenInclude(oi => oi.Product!)
                            .ThenInclude(p => p.Images!)
                    .Include(o => o.OrderItems!)
                        .ThenInclude(oi => oi.ProductVariant!)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order: {OrderId} for user: {UserId}", orderId, userId);
                throw;
            }
        }

        public async Task<Order> CreateOrderAsync(int userId, int addressId, string paymentMethod)
        {
            try
            {
                // ✅ NULL-SAFE THENINCLUDE (Satır 66 uyarıları düzeltildi)
                var cart = await _context.Carts
                    .Include(c => c.CartItems!)
                        .ThenInclude(ci => ci.Product!)
                    .Include(c => c.CartItems!)
                        .ThenInclude(ci => ci.ProductVariant!)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
                {
                    throw new InvalidOperationException("Cart is empty");
                }

                // Validate address
                var address = await _context.Addresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                {
                    throw new InvalidOperationException("Invalid address");
                }

                // Check stock availability
                foreach (var item in cart.CartItems)
                {
                    if (item.Product == null || item.Product.StockQuantity < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {item.Product?.Name}");
                    }
                }

                // Get user info
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new InvalidOperationException("User not found");
                }

                // Calculate totals - KDV zaten dahil olduğu için ekstra hesaplama yapmıyoruz
                var subtotal = cart.CartItems.Sum(ci => ci.Quantity * ci.Price);

                // Ücretsiz kargo kontrolü - 1500 TL üzeri ücretsiz
                var shippingCost = subtotal >= 1500m ? 0m : await CalculateShippingCostAsync(addressId);

                // Create order
                var order = new Order
                {
                    UserId = userId,
                    OrderNumber = await GenerateOrderNumberAsync(),
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,

                    // Copy address details
                    ShippingFirstName = address.FirstName,
                    ShippingLastName = address.LastName,
                    ShippingEmail = user.Email ?? "",
                    ShippingPhone = address.Phone,
                    ShippingAddress = address.AddressLine1 + (string.IsNullOrEmpty(address.AddressLine2) ? "" : " " + address.AddressLine2),
                    ShippingCity = address.City,
                    ShippingPostalCode = address.PostalCode,
                    ShippingCountry = address.Country,

                    // Payment details
                    PaymentMethod = paymentMethod,

                    // Calculate totals - KDV zaten fiyatlarda dahil
                    TotalAmount = subtotal,           // Ürünlerin toplam fiyatı (KDV dahil)
                    ShippingCost = shippingCost,      // Kargo ücreti (1500 TL üzeri 0)
                    TaxAmount = 0,                    // KDV ayrı hesaplanmıyor çünkü zaten dahil

                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                    OrderItems = new List<OrderItem>()
                };

                // Final total = Subtotal + Shipping (KDV zaten dahil olduğu için eklemiyoruz)
                order.TotalAmount = subtotal + shippingCost;

                _context.Orders.Add(order);

                // Create order items and update stock - 🆕 BEDEN BİLGİSİ EKLENDİ
                foreach (var cartItem in cart.CartItems)
                {
                    var orderItem = new OrderItem
                    {
                        Order = order,
                        ProductId = cartItem.ProductId,
                        ProductVariantId = cartItem.ProductVariantId, // 🆕 BEDEN BİLGİSİ EKLENDİ
                        ProductName = cartItem.Product?.Name ?? "",
                        UnitPrice = cartItem.Price,
                        Quantity = cartItem.Quantity,
                        TotalPrice = cartItem.Quantity * cartItem.Price,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    order.OrderItems.Add(orderItem);

                    // Update stock
                    if (cartItem.Product != null)
                    {
                        cartItem.Product.StockQuantity -= cartItem.Quantity;
                    }
                }

                // Clear cart
                _context.CartItems.RemoveRange(cart.CartItems);

                await _context.SaveChangesAsync();

                // Sipariş onay emaili gönder
                try
                {
                    // ✅ NULL CHECK - User.Email kontrolü (Satır 49 uyarısı düzeltildi)
                    if (!string.IsNullOrEmpty(user.Email) && !string.IsNullOrEmpty(user.FirstName))
                    {
                        var emailSent = await _emailService.SendOrderConfirmationEmailAsync(
                            user.Email,
                            user.FirstName,
                            order.OrderNumber,
                            order.TotalAmount);

                        if (!emailSent)
                        {
                            _logger.LogWarning("Order confirmation email could not be sent to {Email} for order {OrderNumber}",
                                user.Email, order.OrderNumber);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending order confirmation email for order {OrderNumber}", order.OrderNumber);
                    // Email hatası sipariş oluşturmayı engellemez
                }

                _logger.LogInformation("Order created successfully: {OrderNumber}", order.OrderNumber);
                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

                if (order == null)
                {
                    return false;
                }

                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Processing)
                {
                    _logger.LogWarning("Cannot cancel order {OrderId} with status {Status}", orderId, order.Status);
                    return false;
                }

                order.Status = OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;

                // Restore stock
                if (order.OrderItems != null)
                {
                    foreach (var item in order.OrderItems)
                    {
                        if (item.Product != null)
                        {
                            item.Product.StockQuantity += item.Quantity;
                        }
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order cancelled successfully: {OrderNumber}", order.OrderNumber);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<Order?> GetOrderByOrderNumberAsync(string orderNumber)
        {
            try
            {
                // ✅ NULL-SAFE THENINCLUDE (Satır 214 uyarısı düzeltildi)
#pragma warning disable CS8620
                return await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
#pragma warning restore CS8620
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order by number: {OrderNumber}", orderNumber);
                throw;
            }
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return false;
                }

                var oldStatus = order.Status;
                order.Status = newStatus;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Status değişikliği email gönder
                try
                {
                    // ✅ NULL CHECK - User ve User.Email kontrolü (Satır 28 tarzı uyarı düzeltildi)
                    if (order.User != null && !string.IsNullOrEmpty(order.User.Email) && !string.IsNullOrEmpty(order.User.FirstName))
                    {
                        var emailSent = await _emailService.SendOrderStatusUpdateEmailAsync(
                            order.User.Email,
                            order.User.FirstName,
                            order.OrderNumber,
                            newStatus.ToString());

                        if (!emailSent)
                        {
                            _logger.LogWarning("Order status update email could not be sent to {Email} for order {OrderNumber}",
                                order.User.Email, order.OrderNumber);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending order status update email for order {OrderNumber}", order.OrderNumber);
                    // Email hatası status güncellemeyi engellemez
                }

                _logger.LogInformation("Order {OrderId} status updated from {OldStatus} to {NewStatus}",
                    orderId, oldStatus, newStatus);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> MarkOrderAsShippedAsync(int orderId, string? trackingNumber = null)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.Status != OrderStatus.Processing)
                {
                    return false;
                }

                order.Status = OrderStatus.Shipped;
                order.UpdatedAt = DateTime.UtcNow;
                // Add tracking number if provided
                // order.TrackingNumber = trackingNumber;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} marked as shipped", orderId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking order as shipped: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> MarkOrderAsDeliveredAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.Status != OrderStatus.Shipped)
                {
                    return false;
                }

                order.Status = OrderStatus.Delivered;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} marked as delivered", orderId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking order as delivered: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> ProcessPaymentAsync(int orderId, string paymentTransactionId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                {
                    return false;
                }

                order.PaymentTransactionId = paymentTransactionId;
                order.PaymentDate = DateTime.UtcNow;
                order.Status = OrderStatus.Processing;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment processed for order {OrderId}", orderId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for order: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> ProcessRefundAsync(int orderId, string reason)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.Status == OrderStatus.Refunded)
                {
                    return false;
                }

                order.Status = OrderStatus.Refunded;
                order.UpdatedAt = DateTime.UtcNow;
                // Add refund reason to a new field if needed

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refund processed for order {OrderId}, Reason: {Reason}", orderId, reason);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for order: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<decimal> GetUserTotalSpentAsync(int userId)
        {
            try
            {
                return await _context.Orders
                    .Where(o => o.UserId == userId && o.Status != OrderStatus.Cancelled)
                    .SumAsync(o => o.TotalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total spent for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<int> GetUserOrderCountAsync(int userId)
        {
            try
            {
                return await _context.Orders
                    .CountAsync(o => o.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order count for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<Dictionary<OrderStatus, int>> GetOrderStatusSummaryAsync(int userId)
        {
            try
            {
                var summary = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .GroupBy(o => o.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Status, x => x.Count);

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order status summary for user: {UserId}", userId);
                throw;
            }
        }

        public Task<bool> ValidateOrderAsync(Order order)
        {
            // Implement order validation logic
            if (order == null) return Task.FromResult(false);
            if (order.OrderItems == null || !order.OrderItems.Any()) return Task.FromResult(false);
            if (order.TotalAmount <= 0) return Task.FromResult(false);
            if (string.IsNullOrEmpty(order.ShippingAddress)) return Task.FromResult(false);

            return Task.FromResult(true);
        }

        public async Task<decimal> CalculateOrderTotalAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return 0;
                }

                var subtotal = order.OrderItems?.Sum(oi => oi.TotalPrice) ?? 0;
                // KDV zaten dahil olduğu için ekstra hesaplama yapmıyoruz
                var total = subtotal + order.ShippingCost;

                return total;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating order total: {OrderId}", orderId);
                throw;
            }
        }

        // ✅ ASYNC WARNING FIX (Satır 479 uyarısı düzeltildi)
        public string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"ORD-{timestamp}-{random}";
        }

        // Wrapper method for async compatibility
        public Task<string> GenerateOrderNumberAsync()
        {
            return Task.FromResult(GenerateOrderNumber());
        }

        public async Task<decimal> CalculateShippingCostAsync(int addressId)
        {
            try
            {
                var address = await _context.Addresses.FindAsync(addressId);
                if (address == null)
                {
                    return 25.00m; // Default shipping cost
                }

                // Basit şehir bazlı kargo hesaplama
                return address.City.ToLower() switch
                {
                    "istanbul" => 20.00m,
                    "ankara" => 25.00m,
                    "izmir" => 25.00m,
                    _ => 30.00m // Diğer şehirler için
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating shipping cost for address: {AddressId}", addressId);
                return 25.00m; // Default shipping cost on error
            }
        }

        public async Task<(IEnumerable<Order> orders, int totalItems)> GetAllOrdersAsync(
            int page,
            int pageSize,
            OrderStatus? status = null,
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .AsQueryable();

                if (status.HasValue)
                {
                    query = query.Where(o => o.Status == status.Value);
                }

                if (startDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate <= endDate.Value);
                }

                var totalItems = await query.CountAsync();

                var orders = await query
                    .OrderByDescending(o => o.OrderDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (orders, totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                throw;
            }
        }

        public async Task<Dictionary<DateTime, decimal>> GetDailySalesAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var sales = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status != OrderStatus.Cancelled)
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount) })
                    .OrderBy(s => s.Date)
                    .ToDictionaryAsync(x => x.Date, x => x.Revenue);

                return sales;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily sales");
                throw;
            }
        }

        public async Task<IEnumerable<(string productName, int quantity, decimal revenue)>> GetTopSellingProductsAsync(int count = 10)
        {
            try
            {
                var topProducts = await _context.OrderItems
                    .Include(oi => oi.Order)
                    .Where(oi => oi.Order!.Status != OrderStatus.Cancelled)
                    .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                    .Select(g => new
                    {
                        ProductName = g.Key.ProductName,
                        Quantity = g.Sum(oi => oi.Quantity),
                        Revenue = g.Sum(oi => oi.TotalPrice)
                    })
                    .OrderByDescending(p => p.Revenue)
                    .Take(count)
                    .ToListAsync();

                return topProducts.Select(p => (p.ProductName, p.Quantity, p.Revenue));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top selling products");
                throw;
            }
        }
    }
}