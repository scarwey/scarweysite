namespace ECommerce.API.Models
{
    public class ProductVariant : BaseEntity
    {
        public int ProductId { get; set; }
        public string Size { get; set; } = string.Empty; // "S", "M", "L", "XL", "42", "43", "38-39" vs.
        public string? SizeDisplay { get; set; } // Gösterim adı: "Small", "Medium", "42 Numara" vs.
        public int StockQuantity { get; set; } // Bu beden için stok
        public decimal? PriceModifier { get; set; } = 0; // Beden bazında fiyat farkı (+/- tutar)
        public bool IsAvailable { get; set; } = true; // Bu beden aktif mi?
        public int SortOrder { get; set; } = 0; // Sıralama için

        // Navigation Properties
        public virtual Product? Product { get; set; }
        public virtual ICollection<CartItem>? CartItems { get; set; } // 🆕 Cart artık variant bazında
        public virtual ICollection<OrderItem>? OrderItems { get; set; } // 🆕 Order artık variant bazında
    }
}
