using PhoneStore.API.DTOs;
using PhoneStore.API.Models;

namespace PhoneStore.API.Interfaces
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();

        Task<Product?> GetByIdAsync(int id);

        Task<Product> CreateAsync(Product product);

        Task<bool> UpdateAsync(Product product);

        Task<bool> DeleteAsync(int id);

        Task<(IEnumerable<Product> Items, int TotalItems)> QueryAsync(ProductQueryDto dto);
    }
}