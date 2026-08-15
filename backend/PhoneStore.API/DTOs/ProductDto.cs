namespace PhoneStore.API.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string? SKU { get; set; }

        public decimal Price { get; set; }

        public decimal? DiscountPrice { get; set; }

        public int Quantity { get; set; }

        public string? Description { get; set; }

        public string? Thumbnail { get; set; }

        public string? Screen { get; set; }

        public string? OperatingSystem { get; set; }

        public string? FrontCamera { get; set; }

        public string? RearCamera { get; set; }

        public string? Chip { get; set; }

        public string? RAM { get; set; }

        public string? Storage { get; set; }

        public string? Battery { get; set; }

        public string? Color { get; set; }

        public string? Weight { get; set; }

        public int Warranty { get; set; }

        public string? Status { get; set; }

        public int BrandId { get; set; }

        public string BrandName { get; set; } = string.Empty;

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public int SoldQuantity { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public List<ProductVariantDto> Variants { get; set; } = new();
    }
}