using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandController : ControllerBase
    {
        private readonly IBrandService _brandService;

        public BrandController(IBrandService brandService)
        {
            _brandService = brandService;
        }

        // GET: api/Brand
        // Khách hàng được xem
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var brands = await _brandService.GetAllAsync();

            return Ok(brands);
        }

        // GET: api/Brand/5
        // Khách hàng được xem
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var brand = await _brandService.GetByIdAsync(id);

            if (brand == null)
                return NotFound();

            return Ok(brand);
        }

        // POST: api/Brand
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(Brand brand)
        {
            var createdBrand = await _brandService.CreateAsync(brand);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdBrand.BrandId },
                createdBrand);
        }

        // PUT: api/Brand/5
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Brand brand)
        {
            if (id != brand.BrandId)
                return BadRequest();

            var updated = await _brandService.UpdateAsync(brand);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // DELETE: api/Brand/5
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _brandService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}