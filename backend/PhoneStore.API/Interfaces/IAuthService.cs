using PhoneStore.API.DTOs;
using PhoneStore.API.Models;

namespace PhoneStore.API.Interfaces
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterDto dto);

        Task<LoginResponseDto?> LoginAsync(LoginDto dto);

        Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto dto);

        Task<bool> RevokeTokenAsync(string token);
    }
}