using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Models;

namespace PhoneStore.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();

    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // INDEXES FOR HIGH QUERY PERFORMANCE
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => new { p.BrandId, p.Price })
                  .HasDatabaseName("idx_products_brand_price");

            entity.HasIndex(p => new { p.SoldQuantity, p.CreatedAt })
                  .HasDatabaseName("idx_products_sold_created");

            entity.HasIndex(p => p.CategoryId)
                  .HasDatabaseName("idx_products_category");
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasIndex(v => new { v.ProductId, v.SKU })
                  .HasDatabaseName("idx_variants_product_sku");

            entity.HasIndex(v => new { v.ProductId, v.IsActive })
                  .HasDatabaseName("idx_variants_product_active");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(o => new { o.UserId, o.Status, o.CreatedAt })
                  .HasDatabaseName("idx_orders_user_status_created");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasIndex(d => new { d.OrderId, d.ProductId })
                  .HasDatabaseName("idx_orderdetails_order_product");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasIndex(c => new { c.CartId, c.ProductId })
                  .HasDatabaseName("idx_cartitems_cart_product");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(r => r.Token)
                  .HasDatabaseName("idx_refreshtokens_token");

            entity.HasIndex(r => new { r.UserId, r.IsRevoked })
                  .HasDatabaseName("idx_refreshtokens_user_revoked");
        });
    }
}