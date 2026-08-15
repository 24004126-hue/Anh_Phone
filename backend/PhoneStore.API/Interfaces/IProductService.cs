using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllAsync();

        Task<ProductDto?> GetByIdAsync(int id);

        Task<ProductDto> CreateAsync(CreateProductDto dto);

        Task<bool> UpdateAsync(UpdateProductDto dto);

        Task<bool> DeleteAsync(int id);

        Task<PagedResult<ProductDto>> QueryAsync(ProductQueryDto dto);

        Task<bool> SaveVariantsAsync(int productId, List<ProductVariantDto> variants);
    }
}