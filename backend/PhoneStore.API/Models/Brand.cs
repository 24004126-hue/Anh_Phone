using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.Models
{
    public class Brand
    {
        [Key]
        public int BrandId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BrandName { get; set; } = string.Empty;

        // Navigation Property
        public ICollection<Product>? Products { get; set; }
    }
}