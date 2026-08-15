using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetCartByUserIdAsync(int userId)
        {
            return await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Cart> CreateCartAsync(Cart cart)
        {
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task<CartItem?> GetCartItemAsync(int cartId, int productId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(i => i.CartId == cartId && i.ProductId == productId);
        }

        public async Task<CartItem> AddItemAsync(CartItem item)
        {
            _context.CartItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> UpdateItemAsync(CartItem item)
        {
            _context.CartItems.Update(item);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Cart?> GetCartWithItemsAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }
        public async Task<CartItem?> GetCartItemByIdAsync(int cartItemId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(c => c.CartItemId == cartItemId);
        }

        public async Task<bool> DeleteItemAsync(int cartItemId)
        {
            var item = await _context.CartItems.FindAsync(cartItemId);

            if (item == null)
                return false;

            _context.CartItems.Remove(item);

            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> ClearCartAsync(int cartId)
        {
            var items = await _context.CartItems
                .Where(i => i.CartId == cartId)
                .ToListAsync();

            if (!items.Any())
                return false;

            _context.CartItems.RemoveRange(items);

            return await _context.SaveChangesAsync() > 0;
        }
    }
}