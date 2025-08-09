using ECommerce.API.Models;

namespace ECommerce.API.Services.Interfaces
{
    public interface IProductService
    {
        // Product CRUD Operations (🆕 GÜNCELLENMIŞ - gender parametresi eklendi)
        Task<(IEnumerable<Product> products, int totalItems)> GetProductsAsync(
            int page,
            int pageSize,
            string? search,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            bool? featured = null,
            bool? sale = null,
            string? gender = null); // 🆕 YENİ PARAMETRE

        Task<Product?> GetProductByIdAsync(int id);
        Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 8);
        Task<IEnumerable<string>> GetSearchSuggestionsAsync(string query);
        Task<Product> CreateProductAsync(Product product);
        Task<Product?> UpdateProductAsync(int id, Product product);
        Task<bool> DeleteProductAsync(int id);

        // Stock Management
        Task<bool> UpdateStockAsync(int productId, int quantity);
        Task<bool> CheckStockAvailabilityAsync(int productId, int requestedQuantity);
        Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10);

        // Product Images
        Task<ProductImage> AddProductImageAsync(int productId, ProductImage image);
        Task<bool> RemoveProductImageAsync(int imageId);
        Task<bool> SetMainImageAsync(int imageId);
        Task<bool> DeleteImageAsync(int imageId);

        // Business Logic
        Task<bool> IncrementViewCountAsync(int productId);
        Task<decimal> CalculateDiscountPriceAsync(int productId, decimal discountPercentage);

        // 🆕 YENİ METOTLAR - PRODUCT VARIANT YÖNETİMİ
        Task<ProductVariant> CreateProductVariantAsync(ProductVariant variant);
        Task<ProductVariant?> UpdateProductVariantAsync(int variantId, ProductVariant variant);
        Task<bool> DeleteProductVariantAsync(int variantId);
        Task<IEnumerable<ProductVariant>> GetProductVariantsAsync(int productId);
        Task<bool> CheckVariantStockAsync(int variantId, int requestedQuantity);
        Task<decimal> GetVariantPriceAsync(int variantId);
        
    }
}