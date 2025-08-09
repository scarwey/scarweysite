using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ECommerce.API.Models;

namespace ECommerce.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; } // 🆕 YENİ EKLENEN
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<RefundRequest> RefundRequests { get; set; }
        public DbSet<RefundItem> RefundItems { get; set; } // 🆕 YENİ EKLENEN

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Category relationships
            modelBuilder.Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Product relationships
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Product>()
                .Property(p => p.DiscountPrice)
                .HasColumnType("decimal(18,2)");

            // 🆕 ProductVariant relationships
            modelBuilder.Entity<ProductVariant>()
                .HasOne(pv => pv.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(pv => pv.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductVariant>()
                .Property(pv => pv.PriceModifier)
                .HasColumnType("decimal(18,2)");

            // ProductImage relationships
            modelBuilder.Entity<ProductImage>()
                .HasOne(pi => pi.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cart relationships
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithOne(u => u.Cart)
                .HasForeignKey<Cart>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem relationships
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🆕 CartItem - ProductVariant relationship
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.ProductVariant)
                .WithMany(pv => pv.CartItems)
                .HasForeignKey(ci => ci.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CartItem>()
                .Property(ci => ci.Price)
                .HasColumnType("decimal(18,2)");

            // Order relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.ShippingCost)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TaxAmount)
                .HasColumnType("decimal(18,2)");

            // Order CancelledBy relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.CancelledBy)
                .WithMany()
                .HasForeignKey(o => o.CancelledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // OrderItem relationships
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🆕 OrderItem - ProductVariant relationship
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.ProductVariant)
                .WithMany(pv => pv.OrderItems)
                .HasForeignKey(oi => oi.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.TotalPrice)
                .HasColumnType("decimal(18,2)");

            // RefundRequest relationships
            modelBuilder.Entity<RefundRequest>()
                .HasOne(rr => rr.Order)
                .WithMany(o => o.RefundRequests)
                .HasForeignKey(rr => rr.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefundRequest>()
                .HasOne(rr => rr.RequestedBy)
                .WithMany()
                .HasForeignKey(rr => rr.RequestedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefundRequest>()
                .HasOne(rr => rr.ProcessedBy)
                .WithMany()
                .HasForeignKey(rr => rr.ProcessedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefundRequest>()
                .Property(rr => rr.RefundAmount)
                .HasColumnType("decimal(18,2)");

            // 🆕 RefundItem relationships
            modelBuilder.Entity<RefundItem>()
                .HasOne(ri => ri.RefundRequest)
                .WithMany(rr => rr.RefundItems)
                .HasForeignKey(ri => ri.RefundRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefundItem>()
                .HasOne(ri => ri.OrderItem)
                .WithMany()
                .HasForeignKey(ri => ri.OrderItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefundItem>()
                .Property(ri => ri.RefundAmount)
                .HasColumnType("decimal(18,2)");

            // Address relationships
            modelBuilder.Entity<Address>()
                .HasOne(a => a.User)
                .WithMany(u => u.Addresses)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🆕 INDEXES - Performans için
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.SKU)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Gender)
                .HasDatabaseName("IX_Products_Gender");

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.HasSizes)
                .HasDatabaseName("IX_Products_HasSizes");

            modelBuilder.Entity<ProductVariant>()
                .HasIndex(p => new { p.ProductId, p.Size })
                .IsUnique()
                .HasDatabaseName("IX_ProductVariants_ProductId_Size");

            modelBuilder.Entity<ProductVariant>()
                .HasIndex(p => p.IsAvailable)
                .HasDatabaseName("IX_ProductVariants_IsAvailable");

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderNumber)
                .IsUnique();

            // 🆕 RefundItem indexes
            modelBuilder.Entity<RefundItem>()
                .HasIndex(ri => ri.RefundRequestId);

            modelBuilder.Entity<RefundItem>()
                .HasIndex(ri => ri.OrderItemId);

            // ✅ CONSTRAINTS - YENİ SYNTAX (CS0618 düzeltildi)
            modelBuilder.Entity<Product>()
                .ToTable(t => t.HasCheckConstraint("CK_Product_Gender",
                    "\"Gender\" IS NULL OR \"Gender\" IN ('Erkek', 'Kadın', 'Uniseks', 'Çocuk')"));

            modelBuilder.Entity<ProductVariant>()
                .ToTable(t => t.HasCheckConstraint("CK_ProductVariant_StockQuantity",
                    "\"StockQuantity\" >= 0"));

            modelBuilder.Entity<ProductVariant>()
                .ToTable(t => t.HasCheckConstraint("CK_ProductVariant_SortOrder",
                    "\"SortOrder\" >= 0"));
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && (
                    e.State == EntityState.Added ||
                    e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                ((BaseEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;

                if (entityEntry.State == EntityState.Added)
                {
                    ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}