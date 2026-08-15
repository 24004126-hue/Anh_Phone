using Microsoft.Extensions.Caching.Memory;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _brandRepository;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "brands_all_cache";

        public BrandService(IBrandRepository brandRepository, IMemoryCache cache)
        {
            _brandRepository = brandRepository;
            _cache = cache;
        }

        public async Task<IEnumerable<Brand>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out IEnumerable<Brand>? cachedBrands) && cachedBrands != null)
            {
                return cachedBrands;
            }

            var brands = await _brandRepository.GetAllAsync();
            var brandList = brands.ToList();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
                .SetSlidingExpiration(TimeSpan.FromMinutes(10));

            _cache.Set(CacheKey, brandList, cacheOptions);
            return brandList;
        }

        public async Task<Brand?> GetByIdAsync(int id)
        {
            return await _brandRepository.GetByIdAsync(id);
        }

        public async Task<Brand> CreateAsync(Brand brand)
        {
            var result = await _brandRepository.CreateAsync(brand);
            _cache.Remove(CacheKey);
            return result;
        }

        public async Task<bool> UpdateAsync(Brand brand)
        {
            var result = await _brandRepository.UpdateAsync(brand);
            if (result) _cache.Remove(CacheKey);
            return result;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var result = await _brandRepository.DeleteAsync(id);
            if (result) _cache.Remove(CacheKey);
            return result;
        }
    }
}