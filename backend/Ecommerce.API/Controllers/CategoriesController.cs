using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ApplicationDbContext context, ILogger<CategoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories
                .Where(c => c.IsActive)
                .Include(c => c.SubCategories)
                .Where(c => c.ParentCategoryId == null) // Ana kategoriler
                .ToListAsync();
        }
        // GET: api/categories/{parentId}/subcategories - Alt kategorileri getir
        [HttpGet("{parentId}/subcategories")]
        public async Task<ActionResult<IEnumerable<Category>>> GetSubCategories(int parentId)
        {
            try
            {
                // Ana kategorinin var olup olmadığını kontrol et
                var parentExists = await _context.Categories
                    .AnyAsync(c => c.Id == parentId && c.IsActive);

                if (!parentExists)
                {
                    return NotFound(new { message = "Ana kategori bulunamadı" });
                }

                // Alt kategorileri getir
                var subCategories = await _context.Categories
                    .Where(c => c.ParentCategoryId == parentId && c.IsActive)
                    .Select(c => new Category
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        ParentCategoryId = c.ParentCategoryId,
                        IsActive = c.IsActive,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                _logger.LogInformation("Alt kategoriler getirildi: ParentId={ParentId}, Count={Count}",
                    parentId, subCategories.Count);

                return Ok(subCategories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Alt kategoriler getirilirken hata oluştu: ParentId={ParentId}", parentId);
                return StatusCode(500, new { message = "Alt kategoriler yüklenirken hata oluştu" });
            }
        }

        // 🆕 BONUS: Tüm kategorileri hierarchical yapıda getiren endpoint (ürün ekleme için kullanılabilir)
        [HttpGet("hierarchical")]
        public async Task<ActionResult<IEnumerable<object>>> GetHierarchicalCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .Where(c => c.IsActive)
                    .Include(c => c.SubCategories!.Where(sc => sc.IsActive))
                    .Where(c => c.ParentCategoryId == null) // Ana kategoriler
                    .OrderBy(c => c.Name)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Description,
                        ParentCategoryId = (int?)null,
                        IsParent = true,
                        SubCategories = c.SubCategories!
                            .Where(sc => sc.IsActive)
                            .OrderBy(sc => sc.Name)
                            .Select(sc => new
                            {
                                sc.Id,
                                sc.Name,
                                sc.Description,
                                sc.ParentCategoryId,
                                IsParent = false
                            })
                            .ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation("Hierarchical kategoriler getirildi: MainCategories={MainCount}, " +
                    "TotalSubCategories={SubCount}",
                    categories.Count,
                    categories.Sum(c => c.SubCategories.Count));

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hierarchical kategoriler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Kategoriler yüklenirken hata oluştu" });
            }
        }
        // GET: api/categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.SubCategories)
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // GET: api/categories/admin/all - TÜM kategoriler (aktif + pasif)
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Category>>> GetAllCategoriesForAdmin()
        {
            return await _context.Categories
                .Include(c => c.SubCategories)
                .Include(c => c.Products!.Where(p => p.IsActive)) // 🆕 Sadece aktif ürünleri dahil et
                .Where(c => c.ParentCategoryId == null) // Ana kategoriler
                .ToListAsync(); // IsActive filtresi YOK
        }

        // 🆕 YENİ ENDPOINT: Kategori silme öncesi bilgi alma
        [HttpGet("{id}/delete-info")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetCategoryDeleteInfo(int id)
        {
            try
            {
                var category = await _context.Categories
                    .Include(c => c.Products!.Where(p => p.IsActive))
                    .Include(c => c.SubCategories!.Where(sc => sc.IsActive))
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı" });
                }

                var activeProductCount = category.Products?.Count(p => p.IsActive) ?? 0;
                var activeSubCategoryCount = category.SubCategories?.Count(sc => sc.IsActive) ?? 0;

                // Alt kategorilerdeki ürün sayısını da hesapla
                var subCategoryProductCount = 0;
                if (category.SubCategories != null)
                {
                    foreach (var subCategory in category.SubCategories.Where(sc => sc.IsActive))
                    {
                        var subCatProducts = await _context.Products
                            .Where(p => p.CategoryId == subCategory.Id && p.IsActive)
                            .CountAsync();
                        subCategoryProductCount += subCatProducts;
                    }
                }

                var totalProductCount = activeProductCount + subCategoryProductCount;

                _logger.LogInformation("Category delete info requested: ID={CategoryId}, Products={ProductCount}, SubCategories={SubCategoryCount}",
                    id, totalProductCount, activeSubCategoryCount);

                return Ok(new
                {
                    categoryId = id,
                    categoryName = category.Name,
                    directProductCount = activeProductCount,
                    subCategoryCount = activeSubCategoryCount,
                    subCategoryProductCount = subCategoryProductCount,
                    totalProductCount = totalProductCount,
                    canDelete = true, // Admin her zaman silebilir, ama uyarı gösterilir
                    warning = totalProductCount > 0
                        ? $"Bu kategori silinirse {totalProductCount} ürün de kalıcı olarak silinecek!"
                        : activeSubCategoryCount > 0
                        ? $"Bu kategori silinirse {activeSubCategoryCount} alt kategori de kalıcı olarak silinecek!"
                        : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category delete info: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori bilgisi alınırken hata oluştu" });
            }
        }

        // GET: api/categories/5/products
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<Product>>> GetCategoryProducts(int id)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == id && c.IsActive);

            if (!categoryExists)
            {
                return NotFound();
            }

            var products = await _context.Products
                .Where(p => p.CategoryId == id && p.IsActive)
                .Include(p => p.Images)
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }

            category.UpdatedAt = DateTime.UtcNow;
            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // 🔥 GÜVENLİ HARD DELETE - TAM CASCADE SİLME
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var category = await _context.Categories
                    .Include(c => c.Products)
                    .Include(c => c.SubCategories)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                {
                    return NotFound(new { message = "Kategori bulunamadı" });
                }

                // 📊 Silme öncesi istatistik topla
                var directProductCount = category.Products?.Count ?? 0;
                var subCategoryCount = category.SubCategories?.Count ?? 0;
                var totalDeletedProducts = 0;
                var totalDeletedCartItems = 0;
                var totalDeletedOrderItems = 0;
                var totalDeletedSubCategories = 0;

                _logger.LogWarning("🔥 HARD DELETE BAŞLATILIYOR: Category={CategoryName}({CategoryId}), Products={ProductCount}, SubCategories={SubCategoryCount}",
                    category.Name, id, directProductCount, subCategoryCount);

                // 🗑️ 1. ADIM: Alt kategorileri ve ürünlerini sil
                if (category.SubCategories != null && category.SubCategories.Count > 0)
                {
                    foreach (var subCategory in category.SubCategories.ToList())
                    {
                        // Alt kategorinin ürünlerini al
                        var subCategoryProducts = await _context.Products
                            .Where(p => p.CategoryId == subCategory.Id)
                            .Select(p => p.Id)
                            .ToListAsync();

                        if (subCategoryProducts.Count > 0)
                        {
                            // Bu ürünlere ait cart item'ları sil
                            var subCategoryCartItems = await _context.CartItems
                                .Where(ci => subCategoryProducts.Contains(ci.ProductId))
                                .ToListAsync();

                            if (subCategoryCartItems.Count > 0)
                            {
                                _context.CartItems.RemoveRange(subCategoryCartItems);
                                totalDeletedCartItems += subCategoryCartItems.Count;
                                _logger.LogWarning("🗑️ Alt kategori cart items silindi: {Count} item", subCategoryCartItems.Count);
                            }

                            // Bu ürünlere ait order item'ları sil
                            var subCategoryOrderItems = await _context.OrderItems
                                .Where(oi => subCategoryProducts.Contains(oi.ProductId))
                                .ToListAsync();

                            if (subCategoryOrderItems.Count > 0)
                            {
                                _context.OrderItems.RemoveRange(subCategoryOrderItems);
                                totalDeletedOrderItems += subCategoryOrderItems.Count;
                                _logger.LogWarning("🗑️ Alt kategori order items silindi: {Count} item", subCategoryOrderItems.Count);
                            }

                            // Bu ürünlere ait product variant'ları sil
                            var subCategoryVariants = await _context.ProductVariants
                                .Where(pv => subCategoryProducts.Contains(pv.ProductId))
                                .ToListAsync();

                            if (subCategoryVariants.Count > 0)
                            {
                                _context.ProductVariants.RemoveRange(subCategoryVariants);
                                _logger.LogWarning("🗑️ Alt kategori product variants silindi: {Count} variant", subCategoryVariants.Count);
                            }

                            // Bu ürünlere ait product image'ları sil
                            var subCategoryImages = await _context.ProductImages
                                .Where(pi => subCategoryProducts.Contains(pi.ProductId))
                                .ToListAsync();

                            if (subCategoryImages.Count > 0)
                            {
                                _context.ProductImages.RemoveRange(subCategoryImages);
                                _logger.LogWarning("🗑️ Alt kategori product images silindi: {Count} image", subCategoryImages.Count);
                            }

                            // Son olarak ürünleri sil
                            var productsToDelete = await _context.Products
                                .Where(p => subCategoryProducts.Contains(p.Id))
                                .ToListAsync();

                            _context.Products.RemoveRange(productsToDelete);
                            totalDeletedProducts += productsToDelete.Count;
                            _logger.LogWarning("🗑️ Alt kategori ürünleri silindi: {SubCategoryName} - {ProductCount} ürün",
                                subCategory.Name, productsToDelete.Count);
                        }

                        // Alt kategoriyi sil
                        _context.Categories.Remove(subCategory);
                        totalDeletedSubCategories++;
                        _logger.LogWarning("🗑️ Alt kategori silindi: {SubCategoryName}({SubCategoryId})",
                            subCategory.Name, subCategory.Id);
                    }
                }

                // 🗑️ 2. ADIM: Ana kategorinin ürünlerini sil
                if (category.Products != null && category.Products.Count > 0)
                {
                    var mainCategoryProductIds = category.Products.Select(p => p.Id).ToList();

                    // Ana kategorinin ürünlerine ait cart item'ları sil
                    var mainCategoryCartItems = await _context.CartItems
                        .Where(ci => mainCategoryProductIds.Contains(ci.ProductId))
                        .ToListAsync();

                    if (mainCategoryCartItems.Count > 0)
                    {
                        _context.CartItems.RemoveRange(mainCategoryCartItems);
                        totalDeletedCartItems += mainCategoryCartItems.Count;
                        _logger.LogWarning("🗑️ Ana kategori cart items silindi: {Count} item", mainCategoryCartItems.Count);
                    }

                    // Ana kategorinin ürünlerine ait order item'ları sil
                    var mainCategoryOrderItems = await _context.OrderItems
                        .Where(oi => mainCategoryProductIds.Contains(oi.ProductId))
                        .ToListAsync();

                    if (mainCategoryOrderItems.Count > 0)
                    {
                        _context.OrderItems.RemoveRange(mainCategoryOrderItems);
                        totalDeletedOrderItems += mainCategoryOrderItems.Count;
                        _logger.LogWarning("🗑️ Ana kategori order items silindi: {Count} item", mainCategoryOrderItems.Count);
                    }

                    // Ana kategorinin ürünlerine ait product variant'ları sil
                    var mainCategoryVariants = await _context.ProductVariants
                        .Where(pv => mainCategoryProductIds.Contains(pv.ProductId))
                        .ToListAsync();

                    if (mainCategoryVariants.Count > 0)
                    {
                        _context.ProductVariants.RemoveRange(mainCategoryVariants);
                        _logger.LogWarning("🗑️ Ana kategori product variants silindi: {Count} variant", mainCategoryVariants.Count);
                    }

                    // Ana kategorinin ürünlerine ait product image'ları sil
                    var mainCategoryImages = await _context.ProductImages
                        .Where(pi => mainCategoryProductIds.Contains(pi.ProductId))
                        .ToListAsync();

                    if (mainCategoryImages.Count > 0)
                    {
                        _context.ProductImages.RemoveRange(mainCategoryImages);
                        _logger.LogWarning("🗑️ Ana kategori product images silindi: {Count} image", mainCategoryImages.Count);
                    }

                    // Son olarak ana kategorinin ürünlerini sil
                    _context.Products.RemoveRange(category.Products);
                    totalDeletedProducts += category.Products.Count;
                    _logger.LogWarning("🗑️ Ana kategori ürünleri silindi: {ProductCount} ürün", category.Products.Count);
                }

                // 🗑️ 3. ADIM: Ana kategoriyi sil
                _context.Categories.Remove(category);
                _logger.LogWarning("🗑️ Ana kategori silindi: {CategoryName}({CategoryId})", category.Name, id);

                // 💾 Değişiklikleri kaydet
                await _context.SaveChangesAsync();

                // ✅ Transaction'ı commit et
                await transaction.CommitAsync();

                _logger.LogInformation("✅ HARD DELETE TAMAMLANDI: Category={CategoryName}({CategoryId}), " +
                    "DeletedProducts={ProductCount}, DeletedCartItems={CartItems}, DeletedOrderItems={OrderItems}, DeletedSubCategories={SubCategories}",
                    category.Name, id, totalDeletedProducts, totalDeletedCartItems, totalDeletedOrderItems, totalDeletedSubCategories);

                return Ok(new
                {
                    message = "Kategori ve ilişkili tüm veriler kalıcı olarak silindi",
                    deletedCategory = category.Name,
                    deletedProducts = totalDeletedProducts,
                    deletedCartItems = totalDeletedCartItems,
                    deletedOrderItems = totalDeletedOrderItems,
                    deletedSubCategories = totalDeletedSubCategories,
                    success = true
                });
            }
            catch (Exception ex)
            {
                // ❌ Hata durumunda rollback yap
                await transaction.RollbackAsync();

                _logger.LogError(ex, "❌ HARD DELETE HATASI: CategoryId={CategoryId}", id);
                return StatusCode(500, new
                {
                    message = "Kategori silinirken hata oluştu",
                    error = ex.Message,
                    success = false
                });
            }
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}