namespace PhoneStore.API.DTOs
{
    public class UpdateUserDto
    {
        public int UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string Role { get; set; } = "Customer";
    }
}