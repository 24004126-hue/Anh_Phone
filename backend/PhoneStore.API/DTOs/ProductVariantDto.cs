namespace PhoneStore.API.DTOs
{
    public class ProductVariantDto
    {
        public int VariantId { get; set; }
        public int ProductId { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? ColorHex { get; set; }
        public string? Storage { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int Quantity { get; set; }
        public string? Thumbnail { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
