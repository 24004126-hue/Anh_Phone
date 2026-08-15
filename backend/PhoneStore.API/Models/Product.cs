using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneStore.API.Models
{
    public class Product
    {
        [Key]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? SKU { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPrice { get; set; }

        public int Quantity { get; set; }

        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Thumbnail { get; set; }

        [MaxLength(100)]
        public string? Screen { get; set; }

        [MaxLength(100)]
        public string? OperatingSystem { get; set; }

        [MaxLength(100)]
        public string? FrontCamera { get; set; }

        [MaxLength(100)]
        public string? RearCamera { get; set; }

        [MaxLength(100)]
        public string? Chip { get; set; }

        [MaxLength(50)]
        public string? RAM { get; set; }

        [MaxLength(50)]
        public string? Storage { get; set; }

        [MaxLength(100)]
        public string? Battery { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(30)]
        public string? Weight { get; set; }

        public int Warranty { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        // Foreign Key
        public int BrandId { get; set; }
        public Brand? Brand { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public int SoldQuantity { get; set; } = 0;

        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}