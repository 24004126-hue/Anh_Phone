using BCrypt.Net;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();

            return users.Select(ToDto);
        }

        public async Task<UserDto?> GetByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
                return null;

            return ToDto(user);
        }

        public async Task<UserDto?> GetByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);

            if (user == null)
                return null;

            return ToDto(user);
        }

        public async Task<UserDto> CreateAsync(CreateUserDto dto)
        {
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Address = dto.Address,
                Role = dto.Role
            };

            var createdUser =
                await _userRepository.CreateAsync(user);

            return ToDto(createdUser);
        }

        public async Task<bool> UpdateAsync(UpdateUserDto dto)
        {
            var user =
                await _userRepository.GetByIdAsync(dto.UserId);

            if (user == null)
                return false;

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.Address = dto.Address;
            user.Role = dto.Role;

            return await _userRepository.UpdateAsync(user);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }

        private static UserDto ToDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }
    }
}