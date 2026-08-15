using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();

        Task<UserDto?> GetByIdAsync(int id);

        Task<UserDto?> GetByEmailAsync(string email);

        Task<UserDto> CreateAsync(CreateUserDto dto);

        Task<bool> UpdateAsync(UpdateUserDto dto);

        Task<bool> DeleteAsync(int id);
    }
}