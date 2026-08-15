using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using System.Security.Claims;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/User
        // Chỉ Admin được xem tất cả User
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();

            return Ok(users);
        }

        // GET: api/User/5
        // Admin xem bất kỳ User.
        // Customer chỉ xem chính mình.
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var currentUserId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier)!);

            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && currentUserId != id)
            {
                return Forbid();
            }

            var user = await _userService.GetByIdAsync(id);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // GET: api/User/email/...
        // Chỉ Admin được tìm User bằng email
        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var user = await _userService.GetByEmailAsync(email);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // POST: api/User
        // Chỉ Admin được tạo User trực tiếp
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateUserDto dto)
        {
            try
            {
                var createdUser =
                    await _userService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = createdUser.UserId },
                    createdUser
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT: api/User/5
        // Admin sửa bất kỳ User.
        // Customer chỉ được sửa chính mình.
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateUserDto dto)
        {
            try
            {
                if (id != dto.UserId)
                {
                    return BadRequest(new
                    {
                        message = "ID không khớp."
                    });
                }

                var currentUserId =
                    int.Parse(
                        User.FindFirstValue(
                            ClaimTypes.NameIdentifier)!);

                var isAdmin = User.IsInRole("Admin");

                if (!isAdmin && currentUserId != id)
                {
                    return Forbid();
                }

                var updated =
                    await _userService.UpdateAsync(dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Không tìm thấy người dùng."
                    });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE: api/User/5
        // Chỉ Admin được xóa User
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted =
                    await _userService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Không tìm thấy người dùng."
                    });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}