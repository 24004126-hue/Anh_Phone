using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("AuthLimiter")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var user = await _authService.RegisterAsync(dto);

                return Ok(new
                {
                    message = "Đăng ký thành công",
                    user.UserId,
                    user.FullName,
                    user.Email,
                    user.Role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message = "Email hoặc mật khẩu không đúng."
                });
            }

            return Ok(result);
        }

        // POST: api/Auth/refresh-token
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            var result = await _authService.RefreshTokenAsync(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message = "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
                });
            }

            return Ok(result);
        }

        // POST: api/Auth/revoke-token
        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequestDto dto)
        {
            var revoked = await _authService.RevokeTokenAsync(dto.RefreshToken);

            if (!revoked)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy token hợp lệ để thu hồi."
                });
            }

            return Ok(new
            {
                message = "Đã thu hồi token thành công."
            });
        }
    }
}