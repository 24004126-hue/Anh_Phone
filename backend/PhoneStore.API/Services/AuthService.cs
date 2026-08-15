using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly JwtService _jwtService;
        private readonly ApplicationDbContext _context;

        public AuthService(
            IAuthRepository authRepository,
            JwtService jwtService,
            ApplicationDbContext context)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
            _context = context;
        }

        public async Task<User> RegisterAsync(RegisterDto dto)
        {
            var exist = await _authRepository.GetByEmailAsync(dto.Email);

            if (exist != null)
                throw new Exception("Email đã tồn tại trên hệ thống.");

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim().ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 11),
                Role = "Customer",
                CreatedAt = DateTime.UtcNow
            };

            return await _authRepository.RegisterAsync(user);
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return null;

            var user = await _authRepository.GetByEmailAsync(dto.Email.Trim().ToLowerInvariant());

            if (user == null)
                return null;

            bool checkPassword = false;
            try
            {
                checkPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            }
            catch
            {
                // Fallback check for plain-text password compatibility if database was manually seeded
                checkPassword = (dto.Password == user.PasswordHash);
            }

            if (!checkPassword)
                return null;

            // Generate Access Token & Refresh Token
            var accessToken = _jwtService.GenerateToken(user);
            var refreshTokenString = _jwtService.GenerateRefreshToken();

            try
            {
                // Save Refresh Token to Database (7 days lifetime)
                var refreshToken = new RefreshToken
                {
                    UserId = user.UserId,
                    Token = refreshTokenString,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    CreatedAt = DateTime.UtcNow,
                    IsRevoked = false
                };

                _context.RefreshTokens.Add(refreshToken);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Warning] Failed to save refresh token to database: {ex.Message}");
            }

            return new LoginResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshTokenString,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RefreshToken))
                return null;

            try
            {
                var existingToken = await _context.RefreshTokens
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Token == dto.RefreshToken);

                if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
                {
                    return null;
                }

                var user = existingToken.User;
                if (user == null)
                    return null;

                // Revoke old refresh token (Token Rotation Security Pattern)
                existingToken.IsRevoked = true;

                // Generate new Access Token and new Refresh Token
                var newAccessToken = _jwtService.GenerateToken(user);
                var newRefreshTokenString = _jwtService.GenerateRefreshToken();

                var newRefreshToken = new RefreshToken
                {
                    UserId = user.UserId,
                    Token = newRefreshTokenString,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    CreatedAt = DateTime.UtcNow,
                    IsRevoked = false
                };

                _context.RefreshTokens.Add(newRefreshToken);
                await _context.SaveChangesAsync();

                return new TokenResponseDto
                {
                    Token = newAccessToken,
                    RefreshToken = newRefreshTokenString,
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] RefreshTokenAsync error: {ex.Message}");
                return null;
            }
        }

        public async Task<bool> RevokeTokenAsync(string token)
        {
            try
            {
                var existingToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(r => r.Token == token);

                if (existingToken == null)
                    return false;

                existingToken.IsRevoked = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch
            {
                return false;
            }
        }
    }
}