using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using PhoneStore.API.DTOs;
using PhoneStore.API.Services;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace PhoneStore.Tests
{
    public class StorageAndEmailTests
    {
        [Fact]
        public async Task LocalStorageFallback_WhenNoCloudinary_ShouldSaveLocally()
        {
            // Arrange
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["CloudinarySettings:CloudName"]).Returns("");
            configMock.Setup(c => c["CloudinarySettings:ApiKey"]).Returns("");
            configMock.Setup(c => c["CloudinarySettings:ApiSecret"]).Returns("");

            var loggerMock = new Mock<ILogger<CloudinaryStorageService>>();
            var storageService = new CloudinaryStorageService(configMock.Object, loggerMock.Object);

            var content = "fake image content";
            var bytes = Encoding.UTF8.GetBytes(content);
            using var stream = new MemoryStream(bytes);
            var formFile = new FormFile(stream, 0, bytes.Length, "file", "test-phone.png")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/png"
            };

            // Act
            var resultUrl = await storageService.UploadImageAsync(formFile, "test-products");

            // Assert
            Assert.NotNull(resultUrl);
            Assert.Contains("/uploads/test-products/", resultUrl);
            Assert.EndsWith(".png", resultUrl);
        }

        [Fact]
        public async Task EmailService_WhenUnconfigured_ShouldSimulateGracefullyWithoutCrash()
        {
            // Arrange
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["EmailSettings:Host"]).Returns("smtp.gmail.com");
            configMock.Setup(c => c["EmailSettings:Port"]).Returns("587");
            configMock.Setup(c => c["EmailSettings:Username"]).Returns("");
            configMock.Setup(c => c["EmailSettings:Password"]).Returns("");

            var loggerMock = new Mock<ILogger<EmailService>>();
            var emailService = new EmailService(configMock.Object, loggerMock.Object);

            var order = new OrderDto
            {
                OrderId = 999,
                ReceiverName = "Khách Hàng Test",
                ReceiverPhone = "0987654321",
                ShippingAddress = "123 Đường Công Nghệ, Q1, TP.HCM",
                PaymentMethod = "COD",
                TotalAmount = 34990000,
                CreatedAt = System.DateTime.Now,
                Items = new System.Collections.Generic.List<OrderDetailDto>
                {
                    new OrderDetailDto
                    {
                        ProductId = 1,
                        ProductName = "iPhone 16 Pro Max 256GB Titan Sa Mạc",
                        Quantity = 1,
                        UnitPrice = 34990000,
                        TotalPrice = 34990000
                    }
                }
            };

            // Act
            var result = await emailService.SendOrderInvoiceEmailAsync(order, "customer@example.com");

            // Assert
            Assert.True(result); // Returns true (gracefully simulated)
        }
    }
}
