using System.ComponentModel.DataAnnotations;

namespace PhoneStore.API.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Customer";

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}