using Microsoft.AspNetCore.Mvc;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;


namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ICloudinaryService cloudinaryService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }
        
        // ✅ DÜZELTILMIŞ GetProducts method
        [HttpGet]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? categoryIds = null, // ✅ categoryIds parametresi eklendi
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "name",
            [FromQuery] bool? featured = null,
            [FromQuery] bool? sale = null,
            [FromQuery] string? gender = null)
        {
            try
            {
                // 🔍 DEBUG LOGLARI - Gelen parametreleri logla
                _logger.LogInformation("🚀 GetProducts called - Raw categoryIds: '{CategoryIds}'", categoryIds ?? "null");
                _logger.LogInformation("🚀 GetProducts called - Raw categoryId: '{CategoryId}'", categoryId?.ToString() ?? "null");
                _logger.LogInformation("🚀 GetProducts called - Gender: '{Gender}'", gender ?? "null");

                // ✅ categoryIds parse etme
                if (!string.IsNullOrEmpty(categoryIds))
                {
                    try
                    {
                        categoryId = int.Parse(categoryIds.Split(',')[0]);
                        _logger.LogInformation("📂 Parsed categoryId from categoryIds: {CategoryId}", categoryId);
                    }
                    catch (Exception parseEx)
                    {
                        _logger.LogWarning("⚠️ Error parsing categoryIds '{CategoryIds}': {Error}", categoryIds, parseEx.Message);
                    }
                }

                _logger.LogInformation("🔧 Final categoryId being sent to service: {CategoryId}", categoryId?.ToString() ?? "null");
// ✅ categoryIds'i List<int> olarak parse et
List<int>? categoryIdsList = null;
if (!string.IsNullOrEmpty(categoryIds))
{
    try
    {
        categoryIdsList = categoryIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                   .Select(int.Parse)
                                   .ToList();
        _logger.LogInformation("📂 Parsed categoryIds: [{CategoryIds}]", string.Join(", ", categoryIdsList));
    }
    catch (FormatException)
    {
        _logger.LogWarning("⚠️ Invalid categoryIds format: {CategoryIds}", categoryIds);
        return BadRequest(new { message = "Invalid categoryIds format" });
    }
}

// ✅ Service metodunu yeni parametre ile çağır
var (products, totalItems) = await _productService.GetProductsAsync(
    page, pageSize, search, categoryIdsList, minPrice, maxPrice, sortBy, featured, sale, gender);
                //                      ↑ categoryId yerine categoryIdsList
    
    

                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                // 🔍 DEBUG - Dönen sonuçları logla
                _logger.LogInformation("✅ Service returned {Count} products out of {TotalItems} total", products.Count(), totalItems);
                
                // İlk 3 ürünün kategori bilgilerini logla
                foreach(var product in products.Take(3))
                {
                    _logger.LogInformation("📦 Product: '{Name}', CategoryId: {CategoryId}", product.Name, product.CategoryId);
                }

                return Ok(new
                {
                    products,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalItems,
                        totalPages
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in GetProducts");
                return StatusCode(500, new { message = "An error occurred while fetching products", error = ex.Message });
            }
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);

                if (product == null)
                {
                    return NotFound();
                }

                // Increment view count
                await _productService.IncrementViewCountAsync(id);

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the product", error = ex.Message });
            }
        }

        // GET: api/products/featured
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<Product>>> GetFeaturedProducts()
        {
            try
            {
                var products = await _productService.GetFeaturedProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching featured products", error = ex.Message });
            }
        }

        // GET: api/products/search-suggestions?q=shirt
        [HttpGet("search-suggestions")]
        public async Task<ActionResult<IEnumerable<string>>> GetSearchSuggestions([FromQuery] string q)
        {
            try
            {
                var suggestions = await _productService.GetSearchSuggestionsAsync(q);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching suggestions", error = ex.Message });
            }
        }

        // 🆕 GET: api/products/genders - Mevcut cinsiyetleri getir
        [HttpGet("genders")]
        public ActionResult<IEnumerable<string>> GetGenders()
        {
            var genders = new List<string> { "Erkek", "Kadın", "Uniseks", "Çocuk" };
            return Ok(genders);
        }

        // 🆕 GET: api/products/sizes/clothing - Giyim bedenleri
        [HttpGet("sizes/clothing")]
        public ActionResult<IEnumerable<string>> GetClothingSizes()
        {
            var sizes = new List<string> { "XS", "S", "M", "L", "XL", "XXL", "XXXL" };
            return Ok(sizes);
        }

        // 🆕 GET: api/products/sizes/shoes/male - Erkek ayakkabı bedenleri
        [HttpGet("sizes/shoes/male")]
        public ActionResult<IEnumerable<string>> GetMaleShoeSizes()
        {
            var sizes = new List<string> { "39", "40", "41", "42", "43", "44", "45", "46" };
            return Ok(sizes);
        }

        // 🆕 GET: api/products/sizes/shoes/female - Kadın ayakkabı bedenleri
        [HttpGet("sizes/shoes/female")]
        public ActionResult<IEnumerable<string>> GetFemaleShoeSizes()
        {
            var sizes = new List<string> { "35", "36", "37", "38", "39", "40", "41", "42" };
            return Ok(sizes);
        }

        // 🆕 GET: api/products/sizes/kids - Çocuk bedenleri
        [HttpGet("sizes/kids")]
        public ActionResult<IEnumerable<string>> GetKidsSizes()
        {
            var sizes = new List<string> { "2-3 Yaş", "4-5 Yaş", "6-7 Yaş", "8-9 Yaş", "10-11 Yaş", "12-13 Yaş" };
            return Ok(sizes);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            try
            {
                var createdProduct = await _productService.CreateProductAsync(product);
                return CreatedAtAction("GetProduct", new { id = createdProduct.Id }, createdProduct);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the product", error = ex.Message });
            }
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedProduct = await _productService.UpdateProductAsync(id, product);

                if (updatedProduct == null)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the product", error = ex.Message });
            }
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);

                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the product", error = ex.Message });
            }
        }

        // =================================
        // 🆕 PRODUCT VARIANTS ENDPOINTS
        // =================================

        // GET: api/products/5/variants
        [HttpGet("{productId}/variants")]
        public async Task<ActionResult<IEnumerable<ProductVariant>>> GetProductVariants(int productId)
        {
            try
            {
                var variants = await _productService.GetProductVariantsAsync(productId);
                return Ok(variants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching product variants", error = ex.Message });
            }
        }

        // POST: api/products/5/variants
        [HttpPost("{productId}/variants")]
        public async Task<ActionResult<ProductVariant>> CreateProductVariant(int productId, ProductVariant variant)
        {
            try
            {
                variant.ProductId = productId;
                var createdVariant = await _productService.CreateProductVariantAsync(variant);
                return CreatedAtAction("GetProductVariants", new { productId }, createdVariant);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating product variant", error = ex.Message });
            }
        }

        // PUT: api/products/variants/123
        [HttpPut("variants/{variantId}")]
        public async Task<IActionResult> UpdateProductVariant(int variantId, ProductVariant variant)
        {
            try
            {
                variant.Id = variantId;
                var updatedVariant = await _productService.UpdateProductVariantAsync(variantId, variant);

                if (updatedVariant == null)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating product variant", error = ex.Message });
            }
        }

        // DELETE: api/products/variants/123
        [HttpDelete("variants/{variantId}")]
        public async Task<IActionResult> DeleteProductVariant(int variantId)
        {
            try
            {
                var result = await _productService.DeleteProductVariantAsync(variantId);

                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting product variant", error = ex.Message });
            }
        }

        // GET: api/products/variants/123/price - Varyant fiyatını getir
        [HttpGet("variants/{variantId}/price")]
        public async Task<ActionResult<decimal>> GetVariantPrice(int variantId)
        {
            try
            {
                var price = await _productService.GetVariantPriceAsync(variantId);
                return Ok(new { price });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching variant price", error = ex.Message });
            }
        }

        // GET: api/products/variants/123/stock/5 - Varyant stok kontrolü
        [HttpGet("variants/{variantId}/stock/{quantity}")]
        public async Task<ActionResult<bool>> CheckVariantStock(int variantId, int quantity)
        {
            try
            {
                var isAvailable = await _productService.CheckVariantStockAsync(variantId, quantity);
                return Ok(new { isAvailable, variantId, requestedQuantity = quantity });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error checking variant stock", error = ex.Message });
            }
        }

        // =================================
        // 🔄 EXISTING IMAGE ENDPOINTS (Unchanged)
        // =================================

        [HttpPost("{id}/images/upload")]
        public async Task<ActionResult<List<ProductImage>>> UploadProductImages(int id, [FromForm] IFormFileCollection images, [FromForm] string? altText = null)
        {
            try
            {
                var uploadedImages = new List<ProductImage>();

                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                foreach (var image in images)
                {
                    if (image.Length == 0)
                        continue;

                    if (image.Length > 5 * 1024 * 1024) // 5MB limit
                        return BadRequest(new { message = $"File {image.FileName} is too large. Maximum size is 5MB." });

                    if (!image.ContentType.StartsWith("image/"))
                        return BadRequest(new { message = $"File {image.FileName} is not a valid image." });

                    try
                    {
                        var cloudinaryUrl = await _cloudinaryService.UploadImageAsync(image, "products");

                        Console.WriteLine($"✅ Cloudinary Upload Success: {cloudinaryUrl}");

                        var productImage = new ProductImage
                        {
                            ProductId = id,
                            ImageUrl = cloudinaryUrl,
                            AltText = altText ?? $"{product.Name} image",
                            IsMainImage = product.Images?.Count == 0,
                            DisplayOrder = product.Images?.Count ?? 0
                        };

                        var createdImage = await _productService.AddProductImageAsync(id, productImage);
                        uploadedImages.Add(createdImage);

                        Console.WriteLine($"✅ Database Save Success: ID={createdImage.Id}");
                    }
                    catch (Exception uploadEx)
                    {
                        Console.WriteLine($"❌ Upload Error for {image.FileName}: {uploadEx.Message}");
                        return StatusCode(500, new { message = $"Failed to upload {image.FileName}", error = uploadEx.Message });
                    }
                }

                Console.WriteLine($"✅ Upload tamamlandı. Product ID: {id}");
                Console.WriteLine($"✅ Yüklenen resim sayısı: {uploadedImages.Count}");

                foreach (var img in uploadedImages)
                {
                    Console.WriteLine($"✅ Resim: ID={img.Id}, URL={img.ImageUrl}, IsMain={img.IsMainImage}");
                }

                return Ok(uploadedImages);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Upload Error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while uploading images", error = ex.Message });
            }
        }

        [HttpPost("{id}/images")]
        public async Task<ActionResult<ProductImage>> AddProductImage(int id, ProductImage image)
        {
            try
            {
                var createdImage = await _productService.AddProductImageAsync(id, image);
                return Ok(createdImage);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding the image", error = ex.Message });
            }
        }
    }
}