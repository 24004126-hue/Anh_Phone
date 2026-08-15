using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneStore.API.Models
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        public int UserId { get; set; }

        public User? User { get; set; }

        [MaxLength(100)]
        public string? ReceiverName { get; set; }

        [MaxLength(20)]
        public string? ReceiverPhone { get; set; }

        [MaxLength(255)]
        public string? ShippingAddress { get; set; }

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "COD";

        [MaxLength(255)]
        public string? Notes { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}