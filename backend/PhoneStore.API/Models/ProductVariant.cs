using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneStore.API.Models
{
    [Table("ProductVariants")]
    public class ProductVariant
    {
        [Key]
        public int VariantId { get; set; }

        public int ProductId { get; set; }

        [Required]
        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(20)]
        public string? ColorHex { get; set; }

        [MaxLength(50)]
        public string? Storage { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPrice { get; set; }

        public int Quantity { get; set; } = 0;

        [MaxLength(255)]
        public string? Thumbnail { get; set; }

        public bool IsActive { get; set; } = true;

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}
