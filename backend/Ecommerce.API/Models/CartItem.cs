namespace ECommerce.API.Models
{
    public class CartItem : BaseEntity
    {
        public int CartId { get; set; }
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; } // 🆕 Beden seçimi için (nullable - beden yoksa null)
        public int Quantity { get; set; }
        public decimal Price { get; set; } // Ürün eklendiğindeki fiyat

        // Navigation Properties
        public virtual Cart? Cart { get; set; }
        public virtual Product? Product { get; set; }
        public virtual ProductVariant? ProductVariant { get; set; } // 🆕 YENİ
    }
}
