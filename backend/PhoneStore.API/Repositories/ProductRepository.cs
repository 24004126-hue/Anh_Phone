using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.Variants.Where(v => v.IsActive))
                .FirstOrDefaultAsync(x => x.ProductId == id);
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);

            await _context.SaveChangesAsync();

            return product;
        }

        public async Task<bool> UpdateAsync(Product product)
        {
            _context.Products.Update(product);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return false;

            _context.Products.Remove(product);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<(IEnumerable<Product> Items, int TotalItems)> QueryAsync(ProductQueryDto dto)
        {
            IQueryable<Product> query = _context.Products
                .Include(x => x.Brand)
                .Include(x => x.Category)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(dto.Keyword))
            {
                var kw = dto.Keyword.Trim();
                query = query.Where(x =>
                    x.ProductName.Contains(kw) ||
                    (x.Brand != null && x.Brand.BrandName.Contains(kw)) ||
                    (x.Category != null && x.Category.CategoryName.Contains(kw)) ||
                    (x.Chip != null && x.Chip.Contains(kw)));
            }

            if (dto.BrandId.HasValue && dto.BrandId.Value > 0)
            {
                query = query.Where(x => x.BrandId == dto.BrandId.Value);
            }

            if (dto.CategoryId.HasValue && dto.CategoryId.Value > 0)
            {
                query = query.Where(x => x.CategoryId == dto.CategoryId.Value);
            }

            if (dto.MinPrice.HasValue && dto.MinPrice.Value > 0)
            {
                query = query.Where(x => (x.DiscountPrice.HasValue && x.DiscountPrice > 0 ? x.DiscountPrice.Value : x.Price) >= dto.MinPrice.Value);
            }

            if (dto.MaxPrice.HasValue && dto.MaxPrice.Value > 0)
            {
                query = query.Where(x => (x.DiscountPrice.HasValue && x.DiscountPrice > 0 ? x.DiscountPrice.Value : x.Price) <= dto.MaxPrice.Value);
            }

            query = dto.SortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(x => x.DiscountPrice.HasValue && x.DiscountPrice > 0 ? x.DiscountPrice.Value : x.Price),
                "price_desc" => query.OrderByDescending(x => x.DiscountPrice.HasValue && x.DiscountPrice > 0 ? x.DiscountPrice.Value : x.Price),
                "name" => query.OrderBy(x => x.ProductName),
                "best_seller" => query.OrderByDescending(x => x.SoldQuantity),
                "newest" => query.OrderByDescending(x => x.CreatedAt),
                _ => query.OrderByDescending(x => x.ProductId)
            };

            var totalItems = await query.CountAsync();
            var page = dto.Page <= 0 ? 1 : dto.Page;
            var pageSize = dto.PageSize <= 0 ? 8 : dto.PageSize;

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalItems);
        }
    }
}