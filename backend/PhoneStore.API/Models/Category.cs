using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.Models
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        // Navigation Property
        public ICollection<Product>? Products { get; set; }
    }
}