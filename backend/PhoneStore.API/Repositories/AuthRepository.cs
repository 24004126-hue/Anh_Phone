using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> RegisterAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}