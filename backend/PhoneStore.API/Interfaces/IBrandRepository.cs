using PhoneStore.API.Models;

namespace PhoneStore.API.Interfaces;

public interface IBrandRepository
{
    Task<IEnumerable<Brand>> GetAllAsync();
    Task<Brand?> GetByIdAsync(int id);
    Task<Brand> CreateAsync(Brand brand);
    Task<bool> UpdateAsync(Brand brand);
    Task<bool> DeleteAsync(int id);
}