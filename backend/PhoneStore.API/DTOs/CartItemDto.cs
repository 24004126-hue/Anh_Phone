namespace PhoneStore.API.DTOs
{
    public class CartItemDto
    {
        public int CartItemId { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string? Thumbnail { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public decimal TotalPrice { get; set; }
    }
}