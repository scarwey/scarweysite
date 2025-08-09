namespace ECommerce.API.Models
{
    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; } // 🆕 Siparişteki beden bilgisi
        public string ProductName { get; set; } = string.Empty; // Sipariş anındaki ürün adı
        public string? SelectedSize { get; set; } // 🆕 Sipariş anındaki beden bilgisi (kayıt için)
        public decimal UnitPrice { get; set; } // Sipariş anındaki birim fiyat
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }

        // Navigation Properties
        public virtual Order? Order { get; set; }
        public virtual Product? Product { get; set; }
        public virtual ProductVariant? ProductVariant { get; set; } // 🆕 YENİ
    }
}
