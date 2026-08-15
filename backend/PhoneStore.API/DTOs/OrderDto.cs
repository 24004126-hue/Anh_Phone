namespace PhoneStore.API.DTOs
{
    public class OrderDto
    {
        public int OrderId { get; set; }

        public int UserId { get; set; }

        public string? CustomerName { get; set; }

        public string? CustomerEmail { get; set; }

        public string? ReceiverName { get; set; }

        public string? ReceiverPhone { get; set; }

        public string? ShippingAddress { get; set; }

        public string PaymentMethod { get; set; } = "COD";

        public string? Notes { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public List<OrderDetailDto> Items { get; set; } = new();
    }
}