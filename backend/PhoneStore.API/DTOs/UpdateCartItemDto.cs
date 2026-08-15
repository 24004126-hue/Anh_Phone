using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.DTOs
{
    public class UpdateCartItemDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int CartItemId { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}