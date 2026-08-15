using PhoneStore.API.DTOs;
using PhoneStore.API.Models;

namespace PhoneStore.API.Mappers
{
    public static class ProductMapper
    {
        public static ProductDto ToDto(this Product product)
        {
            return new ProductDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                SKU = product.SKU,
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                Quantity = product.Quantity,

                Description = product.Description,
                Thumbnail = product.Thumbnail,

                Screen = product.Screen,
                OperatingSystem = product.OperatingSystem,
                FrontCamera = product.FrontCamera,
                RearCamera = product.RearCamera,
                Chip = product.Chip,
                RAM = product.RAM,
                Storage = product.Storage,
                Battery = product.Battery,
                Color = product.Color,
                Weight = product.Weight,
                Warranty = product.Warranty,

                Status = product.Status,

                BrandId = product.BrandId,
                BrandName = product.Brand?.BrandName ?? "",
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName ?? "",
                SoldQuantity = product.SoldQuantity,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                Variants = product.Variants?.Select(v => new ProductVariantDto
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    SKU = v.SKU,
                    Color = v.Color,
                    ColorHex = v.ColorHex,
                    Storage = v.Storage,
                    Price = v.Price,
                    DiscountPrice = v.DiscountPrice,
                    Quantity = v.Quantity,
                    Thumbnail = v.Thumbnail,
                    IsActive = v.IsActive
                }).ToList() ?? new List<ProductVariantDto>()
            };
        }

        public static Product ToEntity(this CreateProductDto dto)
        {
            return new Product
            {
                ProductName = dto.ProductName,
                SKU = dto.SKU,
                Price = dto.Price,
                DiscountPrice = dto.DiscountPrice,
                Quantity = dto.Quantity,
                Description = dto.Description,
                Thumbnail = dto.Thumbnail,
                Screen = dto.Screen,
                OperatingSystem = dto.OperatingSystem,
                FrontCamera = dto.FrontCamera,
                RearCamera = dto.RearCamera,
                Chip = dto.Chip,
                RAM = dto.RAM,
                Storage = dto.Storage,
                Battery = dto.Battery,
                Color = dto.Color,
                Weight = dto.Weight,
                Warranty = dto.Warranty,
                Status = dto.Status,
                BrandId = dto.BrandId,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.Now
            };
        }

        public static void UpdateEntity(this UpdateProductDto dto, Product product)
        {
            product.ProductName = dto.ProductName;
            product.SKU = dto.SKU;
            product.Price = dto.Price;
            product.DiscountPrice = dto.DiscountPrice;
            product.Quantity = dto.Quantity;
            product.Description = dto.Description;
            product.Thumbnail = dto.Thumbnail;
            product.Screen = dto.Screen;
            product.OperatingSystem = dto.OperatingSystem;
            product.FrontCamera = dto.FrontCamera;
            product.RearCamera = dto.RearCamera;
            product.Chip = dto.Chip;
            product.RAM = dto.RAM;
            product.Storage = dto.Storage;
            product.Battery = dto.Battery;
            product.Color = dto.Color;
            product.Weight = dto.Weight;
            product.Warranty = dto.Warranty;
            product.Status = dto.Status;
            product.BrandId = dto.BrandId;
            product.CategoryId = dto.CategoryId;
            product.UpdatedAt = DateTime.Now;
        }
    }
}