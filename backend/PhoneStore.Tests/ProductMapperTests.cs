using PhoneStore.API.DTOs;
using PhoneStore.API.Mappers;
using PhoneStore.API.Models;
using Xunit;

namespace PhoneStore.Tests
{
    public class ProductMapperTests
    {
        [Fact]
        public void ToDto_ShouldMapProductAndVariantsCorrectly()
        {
            // Arrange
            var product = new Product
            {
                ProductId = 10,
                ProductName = "iPhone 16 Pro Max",
                SKU = "IP16PM",
                Price = 34990000,
                DiscountPrice = 32990000,
                Quantity = 50,
                Brand = new Brand { BrandId = 1, BrandName = "Apple" },
                Category = new Category { CategoryId = 2, CategoryName = "Flagship" },
                Variants = new List<ProductVariant>
                {
                    new ProductVariant
                    {
                        VariantId = 101,
                        ProductId = 10,
                        SKU = "IP16PM-256-DESERT",
                        Color = "Titan Sa Mạc",
                        ColorHex = "#C5A880",
                        Storage = "256GB",
                        Price = 34990000,
                        Quantity = 20,
                        IsActive = true
                    }
                }
            };

            // Act
            var dto = product.ToDto();

            // Assert
            Assert.NotNull(dto);
            Assert.Equal(10, dto.ProductId);
            Assert.Equal("iPhone 16 Pro Max", dto.ProductName);
            Assert.Equal("Apple", dto.BrandName);
            Assert.Equal("Flagship", dto.CategoryName);
            Assert.Single(dto.Variants);
            Assert.Equal("256GB", dto.Variants[0].Storage);
            Assert.Equal("Titan Sa Mạc", dto.Variants[0].Color);
        }

        [Fact]
        public void ToEntity_ShouldMapCreateProductDtoCorrectly()
        {
            // Arrange
            var createDto = new CreateProductDto
            {
                ProductName = "Galaxy S24 Ultra",
                SKU = "S24U",
                Price = 29990000,
                Quantity = 30,
                BrandId = 2,
                CategoryId = 1,
                Chip = "Snapdragon 8 Gen 3",
                RAM = "12GB",
                Storage = "512GB"
            };

            // Act
            var entity = createDto.ToEntity();

            // Assert
            Assert.NotNull(entity);
            Assert.Equal("Galaxy S24 Ultra", entity.ProductName);
            Assert.Equal(29990000, entity.Price);
            Assert.Equal("Snapdragon 8 Gen 3", entity.Chip);
            Assert.Equal("12GB", entity.RAM);
        }
    }
}
