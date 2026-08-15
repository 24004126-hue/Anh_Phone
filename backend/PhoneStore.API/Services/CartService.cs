using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;

        public CartService(ICartRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }

        public async Task<CartDto> AddToCartAsync(AddToCartDto dto)
        {
            // Tìm giỏ hàng
            var cart = await _cartRepository.GetCartByUserIdAsync(dto.UserId);

            // Nếu chưa có thì tạo mới
            if (cart == null)
            {
                cart = await _cartRepository.CreateCartAsync(new Cart
                {
                    UserId = dto.UserId
                });
            }

            // Kiểm tra sản phẩm đã có trong giỏ chưa
            var item = await _cartRepository.GetCartItemAsync(cart.CartId, dto.ProductId);

            if (item == null)
            {
                await _cartRepository.AddItemAsync(new CartItem
                {
                    CartId = cart.CartId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                });
            }
            else
            {
                item.Quantity += dto.Quantity;
                await _cartRepository.UpdateItemAsync(item);
            }

            // Trả về giỏ hàng mới nhất
            var updatedCart = await GetCartAsync(dto.UserId);

            return updatedCart!;
        }

        public async Task<CartDto?> GetCartAsync(int userId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(userId);

            if (cart == null)
                return null;

            var dto = new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId
            };

            foreach (var item in cart.CartItems)
            {
                var effectivePrice = (item.Product != null && item.Product.DiscountPrice.HasValue && item.Product.DiscountPrice > 0 && item.Product.DiscountPrice < item.Product.Price)
                    ? item.Product.DiscountPrice.Value
                    : (item.Product?.Price ?? 0);

                dto.Items.Add(new CartItemDto
                {
                    CartItemId = item.CartItemId,
                    ProductId = item.ProductId,
                    ProductName = item.Product?.ProductName ?? "",
                    Thumbnail = item.Product?.Thumbnail,
                    Price = effectivePrice,
                    Quantity = item.Quantity,
                    TotalPrice = effectivePrice * item.Quantity
                });
            }

            dto.TotalQuantity = dto.Items.Sum(i => i.Quantity);
            dto.TotalPrice = dto.Items.Sum(i => i.TotalPrice);

            return dto;
        }
        public async Task<bool> UpdateQuantityAsync(
            UpdateCartItemDto dto)
        {
            var item =
                await _cartRepository.GetCartItemByIdAsync(
                    dto.CartItemId);

            if (item == null)
                return false;

            // Kiểm tra Cart thuộc User hiện tại
            var cart =
                await _cartRepository.GetCartByUserIdAsync(
                    dto.UserId);

            if (cart == null)
                return false;

            if (item.CartId != cart.CartId)
                return false;

            item.Quantity = dto.Quantity;

            return await _cartRepository.UpdateItemAsync(item);
        }

        public async Task<bool> RemoveItemAsync(
            int userId,
            int cartItemId)
        {
            var item =
                await _cartRepository.GetCartItemByIdAsync(
                    cartItemId);

            if (item == null)
                return false;

            // Kiểm tra CartItem thuộc Cart của User
            var cart =
                await _cartRepository.GetCartByUserIdAsync(
                    userId);

            if (cart == null)
                return false;

            if (item.CartId != cart.CartId)
                return false;

            return await _cartRepository.DeleteItemAsync(
                cartItemId);
        }
    }
}