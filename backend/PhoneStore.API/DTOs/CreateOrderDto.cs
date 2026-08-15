using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        public int UserId { get; set; }

        public string? ReceiverName { get; set; }

        public string? ReceiverPhone { get; set; }

        public string ShippingAddress { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = "COD";

        public string? Notes { get; set; }
    }
}