namespace PhoneStore.API.DTOs
{
    public class CartDto
    {
        public int CartId { get; set; }

        public int UserId { get; set; }

        public List<CartItemDto> Items { get; set; } = new();

        public int TotalQuantity { get; set; }

        public decimal TotalPrice { get; set; }
    }
}