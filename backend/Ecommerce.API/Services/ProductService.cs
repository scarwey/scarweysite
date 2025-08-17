using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ✅ GÜNCELLENEN GetProductsAsync - Çoklu kategori desteği
        public async Task<(IEnumerable<Product> products, int totalItems)> GetProductsAsync(
            int page,
            int pageSize,
            string? search,
            List<int>? categoryIds,    // 🔄 int? categoryId → List<int>? categoryIds
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            bool? featured = null,
            bool? sale = null,
            string? gender = null)
        {
            try
            {
                _logger.LogInformation("🔍 GetProductsAsync called with filters: page={Page}, gender={Gender}, categoryIds=[{CategoryIds}], search={Search}, sale={Sale}, featured={Featured}",
                    page, gender, categoryIds != null ? string.Join(",", categoryIds) : "null", search, sale, featured);

                var query = _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Include(p => p.Variants)
                    .Where(p => p.IsActive);

                // ✅ ARAMA FİLTRESİ
                if (!string.IsNullOrWhiteSpace(search))
                {
                    _logger.LogInformation("🔍 Applying search filter: {Search}", search);
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(search.ToLower()) ||
                        p.Description.ToLower().Contains(search.ToLower()) ||
                        p.Brand.ToLower().Contains(search.ToLower()));
                }

                // ProductService.cs'deki kategori filtreleme kısmını bu kodla değiştir:

// ✅ HİERARCHİCAL ÇOKLU KATEGORİ FİLTRELEME - Ana kategori + Alt kategoriler
if (categoryIds != null && categoryIds.Count > 0)
{
    _logger.LogInformation("📂 Applying hierarchical multi-category filter: [{CategoryIds}]", string.Join(", ", categoryIds));
    
    // Seçilen kategoriler + bunların alt kategorilerini bul
    var allCategoryIds = new List<int>();
    
    foreach (var categoryId in categoryIds)
    {
        // Ana kategoriyi ekle
        allCategoryIds.Add(categoryId);
        
        // Bu kategorinin alt kategorilerini bul ve ekle
        var subCategoryIds = await _context.Categories
            .Where(c => c.ParentCategoryId == categoryId && c.IsActive)
            .Select(c => c.Id)
            .ToListAsync();
        
        allCategoryIds.AddRange(subCategoryIds);
        
        if (subCategoryIds.Count > 0)
        {
            _logger.LogInformation("📁 Category {CategoryId} has subcategories: [{SubCategoryIds}]", 
                categoryId, string.Join(", ", subCategoryIds));
        }
    }
    
    // Duplicateları temizle
    allCategoryIds = allCategoryIds.Distinct().ToList();
    
    _logger.LogInformation("📂 Final category filter includes: [{AllCategoryIds}]", string.Join(", ", allCategoryIds));
    
    // Filtreleme uygula: Ana kategoriler + Alt kategoriler
    query = query.Where(p => allCategoryIds.Contains(p.CategoryId));
    
    _logger.LogInformation("📂 Hierarchical multi-category filter applied: Total Categories=[{Count}]", allCategoryIds.Count);
}

                // ✅ CİNSİYET FİLTRESİ - AND mantığı
                if (!string.IsNullOrWhiteSpace(gender))
                {
                    _logger.LogInformation("👤 Applying gender filter: {Gender}", gender);
                    query = query.Where(p => p.Gender == gender);
                }

                // ✅ FİYAT FİLTRELERİ - AND mantığı
                if (minPrice.HasValue)
                {
                    _logger.LogInformation("💰 Applying min price filter: {MinPrice}", minPrice.Value);
                    query = query.Where(p => p.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    _logger.LogInformation("💰 Applying max price filter: {MaxPrice}", maxPrice.Value);
                    query = query.Where(p => p.Price <= maxPrice.Value);
                }

                // ✅ ÖZEL FİLTRELER - AND mantığı
                if (featured.HasValue && featured.Value)
                {
                    _logger.LogInformation("⭐ Applying featured filter");
                    query = query.Where(p => p.IsFeatured);
                }

                if (sale.HasValue && sale.Value)
                {
                    _logger.LogInformation("🔥 Applying sale filter");
                    query = query.Where(p =>
                        p.DiscountPrice.HasValue &&
                        p.DiscountPrice.Value > 0 &&
                        p.DiscountPrice.Value < p.Price);
                }

                // ✅ SIRALAMA
                _logger.LogInformation("📊 Applying sort: {SortBy}", sortBy);
                query = sortBy?.ToLower() switch
                {
                    "price" => query.OrderBy(p => p.DiscountPrice ?? p.Price),
                    "price_desc" => query.OrderByDescending(p => p.DiscountPrice ?? p.Price),
                    "newest" => query.OrderByDescending(p => p.CreatedAt),
                    "popular" => query.OrderByDescending(p => p.ViewCount),
                    "discount" => query.Where(p => p.DiscountPrice.HasValue && p.DiscountPrice.Value > 0)
                                      .OrderByDescending(p => ((p.Price - p.DiscountPrice!.Value) / p.Price) * 100),
                    "name" => query.OrderBy(p => p.Name),
                    "name_desc" => query.OrderByDescending(p => p.Name),
                    _ => query.OrderBy(p => p.Name)
                };

                // ✅ TOPLAM SAYIM VE SONUÇ
                var totalItems = await query.CountAsync();
                _logger.LogInformation("📊 Total items found: {TotalItems}", totalItems);

                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // ✅ DEBUG - İlk 5 ürünün detayını logla
                foreach(var product in products.Take(5))
                {
                    _logger.LogInformation("📦 Product found: '{Name}', CategoryId: {CategoryId}, Gender: {Gender}", 
                        product.Name, product.CategoryId, product.Gender);
                }

                _logger.LogInformation("✅ Products fetched successfully: {Count} items on page {Page}",
                    products.Count, page);

                return (products, totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting products with filters: gender={Gender}, categoryIds=[{CategoryIds}]",
                    gender, categoryIds != null ? string.Join(",", categoryIds) : "null");
                throw;
            }
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Include(p => p.Variants!.Where(v => v.IsActive && v.IsAvailable))
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by id: {ProductId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 8)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Variants!.Where(v => v.IsActive && v.IsAvailable))
                    .Where(p => p.IsActive && p.IsFeatured)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured products");
                throw;
            }
        }

        public async Task<ProductVariant> CreateProductVariantAsync(ProductVariant variant)
        {
            try
            {
                var existingVariant = await _context.ProductVariants
                    .FirstOrDefaultAsync(v => v.ProductId == variant.ProductId && v.Size == variant.Size);

                if (existingVariant != null)
                {
                    _logger.LogInformation("Updating existing variant: ProductId={ProductId}, Size={Size}",
                        variant.ProductId, variant.Size);

                    existingVariant.SizeDisplay = variant.SizeDisplay;
                    existingVariant.StockQuantity = variant.StockQuantity;
                    existingVariant.PriceModifier = variant.PriceModifier;
                    existingVariant.IsAvailable = variant.IsAvailable;
                    existingVariant.SortOrder = variant.SortOrder;
                    existingVariant.IsActive = true;
                    existingVariant.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    await UpdateProductTotalStockAsync(variant.ProductId);

                    _logger.LogInformation("Existing variant updated: ProductId={ProductId}, Size={Size}",
                        variant.ProductId, variant.Size);
                    return existingVariant;
                }

                variant.CreatedAt = DateTime.UtcNow;
                variant.UpdatedAt = DateTime.UtcNow;
                variant.IsActive = true;

                _context.ProductVariants.Add(variant);
                await _context.SaveChangesAsync();
                await UpdateProductTotalStockAsync(variant.ProductId);

                _logger.LogInformation("New product variant created: ProductId={ProductId}, Size={Size}",
                    variant.ProductId, variant.Size);
                return variant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating/updating product variant: ProductId={ProductId}, Size={Size}",
                    variant.ProductId, variant.Size);
                throw;
            }
        }

        public async Task<ProductVariant?> UpdateProductVariantAsync(int variantId, ProductVariant variant)
        {
            try
            {
                var existingVariant = await _context.ProductVariants.FindAsync(variantId);
                if (existingVariant == null)
                {
                    return null;
                }

                existingVariant.Size = variant.Size;
                existingVariant.SizeDisplay = variant.SizeDisplay;
                existingVariant.StockQuantity = variant.StockQuantity;
                existingVariant.PriceModifier = variant.PriceModifier;
                existingVariant.IsAvailable = variant.IsAvailable;
                existingVariant.SortOrder = variant.SortOrder;
                existingVariant.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await UpdateProductTotalStockAsync(existingVariant.ProductId);

                _logger.LogInformation("Product variant updated: ID={VariantId}", variantId);
                return existingVariant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product variant: {VariantId}", variantId);
                throw;
            }
        }

        public async Task<bool> DeleteProductVariantAsync(int variantId)
        {
            try
            {
                var variant = await _context.ProductVariants.FindAsync(variantId);
                if (variant == null)
                {
                    return false;
                }

                _context.ProductVariants.Remove(variant);
                await _context.SaveChangesAsync();
                await UpdateProductTotalStockAsync(variant.ProductId);

                _logger.LogInformation("Product variant HARD deleted: ID={VariantId}", variantId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hard deleting product variant: {VariantId}", variantId);
                throw;
            }
        }

        public async Task<IEnumerable<ProductVariant>> GetProductVariantsAsync(int productId)
        {
            try
            {
                return await _context.ProductVariants
                    .Where(v => v.ProductId == productId && v.IsActive)
                    .OrderBy(v => v.SortOrder)
                    .ThenBy(v => v.Size)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product variants for product: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> CheckVariantStockAsync(int variantId, int requestedQuantity)
        {
            try
            {
                var variant = await _context.ProductVariants
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.Id == variantId && v.IsActive && v.IsAvailable);

                return variant != null && variant.StockQuantity >= requestedQuantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking variant stock: {VariantId}", variantId);
                throw;
            }
        }

        public async Task<decimal> GetVariantPriceAsync(int variantId)
        {
            try
            {
                var variant = await _context.ProductVariants
                    .Include(v => v.Product)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.Id == variantId);

                if (variant == null) return 0;

                var basePrice = variant.Product?.DiscountPrice ?? variant.Product?.Price ?? 0;
                return basePrice + (variant.PriceModifier ?? 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting variant price: {VariantId}", variantId);
                throw;
            }
        }

        private async Task UpdateProductTotalStockAsync(int productId)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null) return;

                if (product.HasSizes)
                {
                    var totalStock = await _context.ProductVariants
                        .Where(v => v.ProductId == productId && v.IsActive)
                        .SumAsync(v => v.StockQuantity);

                    product.StockQuantity = totalStock;
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product total stock: {ProductId}", productId);
            }
        }

        public async Task<IEnumerable<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return new List<string>();
            }

            try
            {
                return await _context.Products
                    .Where(p => p.IsActive && p.Name.ToLower().Contains(query.ToLower()))
                    .Select(p => p.Name)
                    .Distinct()
                    .Take(10)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
                throw;
            }
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            try
            {
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;
                product.IsActive = true;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product created with ID: {ProductId}", product.Id);
                return product;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                throw;
            }
        }

        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            try
            {
                var existingProduct = await _context.Products.FindAsync(id);
                if (existingProduct == null)
                {
                    return null;
                }

                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.DiscountPrice = product.DiscountPrice;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.SKU = product.SKU;
                existingProduct.Brand = product.Brand;
                existingProduct.CategoryId = product.CategoryId;
                existingProduct.IsFeatured = product.IsFeatured;
                existingProduct.Gender = product.Gender;
                existingProduct.HasSizes = product.HasSizes;
                existingProduct.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product updated with ID: {ProductId}", id);
                return existingProduct;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product with ID: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Variants)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                {
                    return false;
                }

                _logger.LogInformation("Performing SOFT DELETE for product: {ProductId}", id);

                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                if (product.Variants != null)
                {
                    foreach (var variant in product.Variants)
                    {
                        variant.IsActive = false;
                        variant.UpdatedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product SOFT DELETED: {ProductId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting product: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.StockQuantity = quantity;
                product.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stock updated for product ID: {ProductId}, New quantity: {Quantity}",
                    productId, quantity);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> CheckStockAvailabilityAsync(int productId, int requestedQuantity)
        {
            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive);

                return product != null && product.StockQuantity >= requestedQuantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking stock availability for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive && p.StockQuantity < threshold)
                    .OrderBy(p => p.StockQuantity)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting low stock products");
                throw;
            }
        }

        public async Task<ProductImage> AddProductImageAsync(int productId, ProductImage image)
        {
            try
            {
                var productExists = await _context.Products
                    .AnyAsync(p => p.Id == productId && p.IsActive);

                if (!productExists)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                image.ProductId = productId;
                image.CreatedAt = DateTime.UtcNow;
                image.UpdatedAt = DateTime.UtcNow;

                _context.ProductImages.Add(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image added for product ID: {ProductId}", productId);
                return image;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding image for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> RemoveProductImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null)
                {
                    return false;
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image removed with ID: {ImageId}", imageId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing image with ID: {ImageId}", imageId);
                throw;
            }
        }

        public async Task<bool> IncrementViewCountAsync(int productId)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.ViewCount++;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing view count for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> SetMainImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null) return false;

                var productImages = await _context.ProductImages
                    .Where(pi => pi.ProductId == image.ProductId)
                    .ToListAsync();

                foreach (var img in productImages)
                {
                    img.IsMainImage = false;
                }

                image.IsMainImage = true;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null) return false;

                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", image.ImageUrl.TrimStart('/'));
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<decimal> CalculateDiscountPriceAsync(int productId, decimal discountPercentage)
        {
            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == productId);

                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                var discountAmount = product.Price * (discountPercentage / 100);
                return product.Price - discountAmount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating discount price for product ID: {ProductId}", productId);
                throw;
            }
        }
    }
}