using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Repositories
{

    public class BrandRepository : IBrandRepository
    {
        private readonly ApplicationDbContext _context;

        public BrandRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Brand>> GetAllAsync()
        {
            return await _context.Brands.ToListAsync();
        }

        public async Task<Brand?> GetByIdAsync(int id)
        {
            return await _context.Brands.FindAsync(id);
        }

        public async Task<Brand> CreateAsync(Brand brand)
        {
            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();
            return brand;
        }

        public async Task<bool> UpdateAsync(Brand brand)
        {
            var existingBrand = await _context.Brands.FindAsync(brand.BrandId);

            if (existingBrand == null)
                return false;

            existingBrand.BrandName = brand.BrandName;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var brand = await _context.Brands.FindAsync(id);

            if (brand == null)
                return false;

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}