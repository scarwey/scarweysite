namespace ECommerce.API.DTOs
{
    public class RefundItemDto
    {
        public int OrderItemId { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal RefundAmount { get; set; }
    }

    // Yeni iade talebi oluþturma için
    public class CreateRefundRequestDto
    {
        public int OrderId { get; set; }
        public string GeneralReason { get; set; } = string.Empty; // Genel sebep
        public List<RefundItemDto> Items { get; set; } = new();
    }

    // Admin için detaylý görüntüleme
    public class RefundRequestDetailDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string GeneralReason { get; set; } = string.Empty;
        public decimal TotalRefundAmount { get; set; }
        public string Type { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string? ProcessedBy { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? AdminNotes { get; set; }

        // Ýade edilen ürünler
        public List<RefundItemDetailDto> RefundItems { get; set; } = new();
    }

    public class RefundItemDetailDto
    {
        public int Id { get; set; }
        public int OrderItemId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public string? Size { get; set; }
        public int Quantity { get; set; }
        public int MaxQuantity { get; set; } // OrderItem'daki toplam miktar
        public decimal UnitPrice { get; set; }
        public decimal RefundAmount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    // Sipariþ ürünlerini göstermek için (modal'da)
    public class OrderItemForRefundDto
    {
        public int Id { get; set; } // OrderItem.Id
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public string? Size { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public bool CanRefund { get; set; } = true; // Bu ürün iade edilebilir mi?
        public int AlreadyRefundedQuantity { get; set; } = 0; // Daha önce iade edilen miktar
    }
}