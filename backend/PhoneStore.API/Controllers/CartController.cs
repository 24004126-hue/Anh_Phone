using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using System.Security.Claims;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // POST: api/Cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(
            [FromBody] AddToCartDto dto)
        {
            try
            {
                var currentUserId =
                    int.Parse(
                        User.FindFirstValue(
                            ClaimTypes.NameIdentifier)!);

                if (currentUserId != dto.UserId)
                {
                    return Forbid();
                }

                var result =
                    await _cartService.AddToCartAsync(dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // GET: api/Cart/1
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            var currentUserId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier)!);

            if (currentUserId != userId &&
                !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var cart =
                await _cartService.GetCartAsync(userId);

            if (cart == null)
            {
                return NotFound(new
                {
                    message = "Cart not found"
                });
            }

            return Ok(cart);
        }

        // PUT: api/Cart/update
        [HttpPut("update")]
        public async Task<IActionResult> UpdateQuantity(
            [FromBody] UpdateCartItemDto dto)
        {
            var currentUserId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier)!);

            if (currentUserId != dto.UserId)
                return Forbid();

            var success =
                await _cartService.UpdateQuantityAsync(dto);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Cart item not found"
                });
            }

            return Ok(new
            {
                message = "Cập nhật số lượng thành công"
            });
        }

        // DELETE: api/Cart/remove/1
        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveItem(
            int cartItemId)
        {
            var currentUserId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier)!);

            var success =
                await _cartService.RemoveItemAsync(
                    currentUserId,
                    cartItemId);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Cart item not found"
                });
            }

            return Ok(new
            {
                message =
                    "Xóa sản phẩm khỏi giỏ hàng thành công"
            });
        }
    }
}