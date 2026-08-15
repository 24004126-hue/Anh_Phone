using Microsoft.Extensions.Caching.Memory;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "categories_all_cache";

        public CategoryService(ICategoryRepository categoryRepository, IMemoryCache cache)
        {
            _categoryRepository = categoryRepository;
            _cache = cache;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out IEnumerable<Category>? cachedCategories) && cachedCategories != null)
            {
                return cachedCategories;
            }

            var categories = await _categoryRepository.GetAllAsync();
            var categoryList = categories.ToList();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
                .SetSlidingExpiration(TimeSpan.FromMinutes(10));

            _cache.Set(CacheKey, categoryList, cacheOptions);
            return categoryList;
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _categoryRepository.GetByIdAsync(id);
        }

        public async Task<Category> CreateAsync(Category category)
        {
            var result = await _categoryRepository.CreateAsync(category);
            _cache.Remove(CacheKey);
            return result;
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            var result = await _categoryRepository.UpdateAsync(category);
            if (result) _cache.Remove(CacheKey);
            return result;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var result = await _categoryRepository.DeleteAsync(id);
            if (result) _cache.Remove(CacheKey);
            return result;
        }
    }
}