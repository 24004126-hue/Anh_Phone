using PhoneStore.API.Models;

namespace PhoneStore.API.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);

        Task<Cart> CreateCartAsync(Cart cart);

        Task<CartItem?> GetCartItemAsync(int cartId, int productId);

        Task<CartItem> AddItemAsync(CartItem item);

        Task<bool> UpdateItemAsync(CartItem item);

        Task<Cart?> GetCartWithItemsAsync(int userId);

        Task<CartItem?> GetCartItemByIdAsync(int cartItemId);

        Task<bool> DeleteItemAsync(int cartItemId);

        Task<bool> ClearCartAsync(int cartId);
    }
}