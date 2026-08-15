using PhoneStore.API.Models;

namespace PhoneStore.API.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User> RegisterAsync(User user);
    }
}