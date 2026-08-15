using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.DTOs
{
    public class UpdateProductDto : CreateProductDto
    {
        [Required]
        public int ProductId { get; set; }
    }
}