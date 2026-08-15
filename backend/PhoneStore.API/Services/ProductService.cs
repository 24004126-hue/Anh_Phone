using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Mappers;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ApplicationDbContext _context;

        public ProductService(IProductRepository productRepository, ApplicationDbContext context)
        {
            _productRepository = productRepository;
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Select(x => x.ToDto());
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
                return null;

            return product.ToDto();
        }

        public async Task<ProductDto> CreateAsync(CreateProductDto dto)
        {
            var entity = dto.ToEntity();
            var created = await _productRepository.CreateAsync(entity);
            return created.ToDto();
        }

        public async Task<bool> UpdateAsync(UpdateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(dto.ProductId);

            if (product == null)
                return false;

            dto.UpdateEntity(product);
            return await _productRepository.UpdateAsync(product);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _productRepository.DeleteAsync(id);
        }

        public async Task<PagedResult<ProductDto>> QueryAsync(ProductQueryDto dto)
        {
            var result = await _productRepository.QueryAsync(dto);

            return new PagedResult<ProductDto>
            {
                Items = result.Items.Select(x => x.ToDto()),
                Page = dto.Page,
                PageSize = dto.PageSize,
                TotalItems = result.TotalItems,
                TotalPages = (int)Math.Ceiling((double)result.TotalItems / (dto.PageSize <= 0 ? 8 : dto.PageSize))
            };
        }

        public async Task<bool> SaveVariantsAsync(int productId, List<ProductVariantDto> variants)
        {
            var product = await _context.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.ProductId == productId);
            if (product == null) return false;

            // Remove existing variants
            _context.ProductVariants.RemoveRange(product.Variants);

            // Add new variants
            if (variants != null && variants.Any())
            {
                foreach (var v in variants)
                {
                    _context.ProductVariants.Add(new ProductVariant
                    {
                        ProductId = productId,
                        SKU = string.IsNullOrWhiteSpace(v.SKU) ? $"{product.SKU}-{v.Storage}-{v.Color}" : v.SKU,
                        Color = v.Color,
                        ColorHex = v.ColorHex,
                        Storage = v.Storage,
                        Price = v.Price > 0 ? v.Price : product.Price,
                        DiscountPrice = v.DiscountPrice,
                        Quantity = v.Quantity,
                        Thumbnail = string.IsNullOrWhiteSpace(v.Thumbnail) ? product.Thumbnail : v.Thumbnail,
                        IsActive = v.IsActive
                    });
                }
            }

            return await _context.SaveChangesAsync() > 0;
        }
    }
}