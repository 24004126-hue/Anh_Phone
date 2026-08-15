using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.DTOs
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
