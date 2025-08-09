namespace ECommerce.API.Models
{
    public class Product : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int StockQuantity { get; set; } // Bu genel stok olacak (tüm bedenlerin toplamı)
        public string SKU { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public bool IsFeatured { get; set; } = false;
        public int ViewCount { get; set; } = 0;

        // 🆕 YENİ ALANLAR
        public string? Gender { get; set; } // "Erkek", "Kadın", "Uniseks", "Çocuk", null (beden gerektirmeyen ürünler için)
        public bool HasSizes { get; set; } = false; // Bu ürünün beden seçenekleri var mı?

        // Navigation Properties
        public virtual Category? Category { get; set; }
        public virtual ICollection<ProductImage>? Images { get; set; }
        public virtual ICollection<CartItem>? CartItems { get; set; }
        public virtual ICollection<OrderItem>? OrderItems { get; set; }
        public virtual ICollection<ProductVariant>? Variants { get; set; } // 🆕 YENİ
    }
}