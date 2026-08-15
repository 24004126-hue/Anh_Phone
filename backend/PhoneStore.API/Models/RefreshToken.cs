using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneStore.API.Models
{
    [Table("RefreshTokens")]
    public class RefreshToken
    {
        [Key]
        public int RefreshTokenId { get; set; }

        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsRevoked { get; set; } = false;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
