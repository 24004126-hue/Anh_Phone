using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET: api/Category
        // Khách hàng được xem
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();

            return Ok(categories);
        }

        // GET: api/Category/5
        // Khách hàng được xem
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        // POST: api/Category
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(Category category)
        {
            var createdCategory =
                await _categoryService.CreateAsync(category);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdCategory.CategoryId },
                createdCategory);
        }

        // PUT: api/Category/5
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            Category category)
        {
            if (id != category.CategoryId)
                return BadRequest();

            var updated =
                await _categoryService.UpdateAsync(category);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // DELETE: api/Category/5
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _categoryService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}