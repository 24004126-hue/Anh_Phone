using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IStorageService _storageService;

        public ProductController(IProductService productService, IStorageService storageService)
        {
            _productService = productService;
            _storageService = storageService;
        }

        // GET: api/Product
        // Cho phép Customer và Admin xem sản phẩm
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllAsync();

            return Ok(products);
        }

        // GET: api/Product/query
        // Cho phép Customer và Admin tìm kiếm sản phẩm
        [HttpGet("query")]
        [AllowAnonymous]
        public async Task<IActionResult> Query(
            [FromQuery] ProductQueryDto dto)
        {
            var result = await _productService.QueryAsync(dto);

            return Ok(result);
        }

        // GET: api/Product/5
        // Cho phép Customer và Admin xem chi tiết sản phẩm
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);

            if (product == null)
                return NotFound();

            return Ok(product);
        }

        // POST: api/Product
        // Chỉ Admin được tạo sản phẩm
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreateProductDto dto)
        {
            var result = await _productService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.ProductId },
                result
            );
        }

        // PUT: api/Product/5
        // Chỉ Admin được sửa sản phẩm
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateProductDto dto)
        {
            if (id != dto.ProductId)
                return BadRequest();

            var success = await _productService.UpdateAsync(dto);

            if (!success)
                return NotFound();

            return NoContent();
        }

        // DELETE: api/Product/5
        // Chỉ Admin được xóa sản phẩm
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        // POST: api/Product/5/variants
        // Chỉ Admin được lưu danh sách biến thể
        [HttpPost("{id:int}/variants")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SaveVariants(int id, [FromBody] List<ProductVariantDto> variants)
        {
            var success = await _productService.SaveVariantsAsync(id, variants);

            if (!success)
                return NotFound(new { message = "Không tìm thấy sản phẩm để cập nhật biến thể." });

            return Ok(new { message = "Cập nhật biến thể thành công." });
        }

        // POST: api/Product/upload-image
        // Chỉ Admin được upload ảnh
        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(
            IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Vui lòng chọn ảnh."
                });
            }

            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            var extension =
                Path.GetExtension(file.FileName)
                    .ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message =
                        "Chỉ hỗ trợ JPG, JPEG, PNG và WEBP."
                });
            }

            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new
                {
                    message = "Dung lượng ảnh tối đa là 5MB."
                });
            }

            var imageUrl = await _storageService.UploadImageAsync(file, "products");

            return Ok(new
            {
                url = imageUrl
            });
        }
    }
}