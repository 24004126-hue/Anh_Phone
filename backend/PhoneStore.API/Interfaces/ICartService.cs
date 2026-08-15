using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> AddToCartAsync(AddToCartDto dto);

        Task<CartDto?> GetCartAsync(int userId);

        Task<bool> UpdateQuantityAsync(
            UpdateCartItemDto dto);

        Task<bool> RemoveItemAsync(
            int userId,
            int cartItemId);
    }
}