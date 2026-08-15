using Microsoft.Extensions.Configuration;
using Moq;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;
using PhoneStore.API.Services;
using Xunit;

namespace PhoneStore.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IAuthRepository> _authRepoMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly JwtService _jwtService;

        public AuthServiceTests()
        {
            _authRepoMock = new Mock<IAuthRepository>();
            _configMock = new Mock<IConfiguration>();

            _configMock.Setup(c => c["Jwt:Key"]).Returns("ThisIsASecretKeyForJwtAuthenticationTestingPurpose123456789!");
            _configMock.Setup(c => c["Jwt:Issuer"]).Returns("PhoneStore");
            _configMock.Setup(c => c["Jwt:Audience"]).Returns("PhoneStoreUser");

            _jwtService = new JwtService(_configMock.Object);
        }

        [Fact]
        public void PasswordHashing_ShouldHashAndVerifyCorrectly()
        {
            // Arrange
            var password = "MySecretPassword123!";

            // Act
            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            var isMatch = BCrypt.Net.BCrypt.Verify(password, hash);

            // Assert
            Assert.NotEmpty(hash);
            Assert.True(isMatch);
        }

        [Fact]
        public void JwtService_GenerateToken_ShouldReturnValidJwt()
        {
            // Arrange
            var user = new User
            {
                UserId = 1,
                FullName = "Nguyễn Văn A",
                Email = "test@phonestore.vn",
                Role = "Customer"
            };

            // Act
            var token = _jwtService.GenerateToken(user);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
            Assert.Contains(".", token); // JWT has 3 parts separated by dots
        }

        [Fact]
        public void JwtService_GenerateRefreshToken_ShouldReturnUniqueTokens()
        {
            // Act
            var token1 = _jwtService.GenerateRefreshToken();
            var token2 = _jwtService.GenerateRefreshToken();

            // Assert
            Assert.NotNull(token1);
            Assert.NotNull(token2);
            Assert.NotEqual(token1, token2);
            Assert.True(token1.Length >= 32);
        }
    }
}
