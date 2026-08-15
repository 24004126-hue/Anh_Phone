using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using System.Security.Claims;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // POST: api/Order/checkout
        // User/Admin đã đăng nhập đều được đặt hàng
        [Authorize]
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(
            CreateOrderDto dto)
        {
            try
            {
                var currentUserId =
                    int.Parse(
                        User.FindFirstValue(
                            ClaimTypes.NameIdentifier)!);

                // Không cho gửi UserId của người khác
                if (currentUserId != dto.UserId)
                {
                    return Forbid();
                }

                var result =
                    await _orderService.CheckoutAsync(dto);

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

        // GET: api/Order/user/1
        // User chỉ được xem đơn của chính mình
        [Authorize]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrders(int userId)
        {
            var currentUserId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier)!);

            var isAdmin =
                User.IsInRole("Admin");

            if (!isAdmin && currentUserId != userId)
            {
                return Forbid();
            }

            var orders =
                await _orderService.GetOrdersAsync(userId);

            return Ok(orders);
        }

        // GET: api/Order/1
        // User/Admin đã đăng nhập mới được xem
        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(
            int orderId)
        {
            var order =
                await _orderService.GetOrderAsync(orderId);

            if (order == null)
                return NotFound();

            var currentUserId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier)!);

            var isAdmin =
                User.IsInRole("Admin");

            if (!isAdmin &&
                order.UserId != currentUserId)
            {
                return Forbid();
            }

            return Ok(order);
        }

        // GET: api/Order/admin
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders =
                await _orderService.GetAllOrdersAsync();

            return Ok(orders);
        }

        // PUT: api/Order/5/status
        // Chỉ Admin
        [Authorize(Roles = "Admin")]
        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateStatus(
            int orderId,
            [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var updated =
                    await _orderService.UpdateStatusAsync(
                        orderId,
                        dto.Status);

                if (!updated)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT: api/Order/5/cancel
        // Khách hàng có thể hủy đơn khi đơn còn ở trạng thái Pending
        [Authorize]
        [HttpPut("{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var isAdmin = User.IsInRole("Admin");

                var order = await _orderService.GetOrderAsync(orderId);
                if (order == null)
                    return NotFound(new { message = "Không tìm thấy đơn hàng." });

                if (!isAdmin && order.UserId != currentUserId)
                    return Forbid();

                if (order.Status != "Pending")
                    return BadRequest(new { message = "Chỉ có thể hủy đơn hàng khi đang ở trạng thái 'Chờ xử lý'." });

                await _orderService.UpdateStatusAsync(orderId, "Cancelled");
                return Ok(new { message = "Hủy đơn hàng thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}