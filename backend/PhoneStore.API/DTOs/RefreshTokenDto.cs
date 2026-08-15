using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.DTOs
{
    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "RefreshToken là bắt buộc.")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class TokenResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
