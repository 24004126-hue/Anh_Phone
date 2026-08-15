using PhoneStore.API.Data;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _context = context;
            _emailService = emailService;
        }

        public async Task<OrderDto> CheckoutAsync(CreateOrderDto dto)
        {
            // Bọc toàn bộ quy trình checkout trong 1 Database Transaction để đảm bảo tính ACID
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _cartRepository.GetCartWithItemsAsync(dto.UserId);

                if (cart == null || !cart.CartItems.Any())
                    throw new Exception("Giỏ hàng trống.");

                // 1. KIỂM TRA VÀ XÁC THỰC TỒN KHO TRỰC TIẾP
                foreach (var item in cart.CartItems)
                {
                    if (item.Product == null)
                        throw new Exception($"Không tìm thấy sản phẩm ID {item.ProductId}.");

                    if (item.Quantity <= 0)
                        throw new Exception($"Số lượng sản phẩm {item.Product.ProductName} không hợp lệ.");

                    if (item.Product.Quantity <= 0)
                        throw new Exception($"Sản phẩm \"{item.Product.ProductName}\" đã hết hàng.");

                    if (item.Quantity > item.Product.Quantity)
                        throw new Exception($"Sản phẩm \"{item.Product.ProductName}\" chỉ còn {item.Product.Quantity} máy trong kho.");
                }

                // 2. TẠO ORDER CHÍNH
                var order = new Order
                {
                    UserId = dto.UserId,
                    ReceiverName = dto.ReceiverName,
                    ReceiverPhone = dto.ReceiverPhone,
                    ShippingAddress = dto.ShippingAddress,
                    PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "COD" : dto.PaymentMethod,
                    Notes = dto.Notes,
                    Status = "Pending",
                    TotalAmount = 0,
                    CreatedAt = DateTime.Now
                };

                order = await _orderRepository.CreateOrderAsync(order);

                decimal total = 0;
                var orderItems = new List<OrderDetailDto>();

                // 3. TẠO ORDER DETAIL + TRỪ TỒN KHO NGUYÊN TỬ + CỘNG SỐ LƯỢNG ĐÃ BÁN
                foreach (var item in cart.CartItems)
                {
                    var product = item.Product!;

                    // Chặn race condition nếu tồn kho bị trừ bởi giao dịch khác
                    if (product.Quantity < item.Quantity)
                    {
                        throw new Exception($"Sản phẩm \"{product.ProductName}\" không đủ số lượng để hoàn tất đơn hàng.");
                    }

                    // Ưu tiên giá giảm nếu có
                    var effectivePrice = (product.DiscountPrice.HasValue && product.DiscountPrice > 0 && product.DiscountPrice < product.Price)
                        ? product.DiscountPrice.Value
                        : product.Price;

                    var detail = new OrderDetail
                    {
                        OrderId = order.OrderId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = effectivePrice,
                        TotalPrice = effectivePrice * item.Quantity
                    };

                    total += detail.TotalPrice;

                    // Trừ tồn kho và cộng dồn số lượng đã bán
                    product.Quantity -= item.Quantity;
                    product.SoldQuantity += item.Quantity;

                    await _orderRepository.CreateOrderDetailAsync(detail);

                    orderItems.Add(new OrderDetailDto
                    {
                        ProductId = item.ProductId,
                        ProductName = product.ProductName,
                        Quantity = item.Quantity,
                        UnitPrice = effectivePrice,
                        TotalPrice = detail.TotalPrice
                    });
                }

                // 4. CẬP NHẬT TỔNG TIỀN ORDER
                order.TotalAmount = total;
                await _orderRepository.UpdateOrderAsync(order);

                // 5. XÓA GIỎ HÀNG SAU KHI ĐẶT THÀNH CÔNG
                await _cartRepository.ClearCartAsync(cart.CartId);

                // 6. COMMIT TRANSACTION
                await transaction.CommitAsync();

                // 7. TẠO DTO TRẢ VỀ
                var resultDto = new OrderDto
                {
                    OrderId = order.OrderId,
                    UserId = order.UserId,
                    ReceiverName = order.ReceiverName,
                    ReceiverPhone = order.ReceiverPhone,
                    ShippingAddress = order.ShippingAddress,
                    PaymentMethod = order.PaymentMethod,
                    Notes = order.Notes,
                    Status = order.Status,
                    TotalAmount = order.TotalAmount,
                    CreatedAt = order.CreatedAt,
                    Items = orderItems
                };

                // 8. TỰ ĐỘNG GỬI EMAIL HÓA ĐƠN ĐIỆN TỬ (NON-BLOCKING ASYNC)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var user = await _context.Users.FindAsync(dto.UserId);
                        var recipientEmail = user?.Email;
                        if (!string.IsNullOrWhiteSpace(recipientEmail))
                        {
                            await _emailService.SendOrderInvoiceEmailAsync(resultDto, recipientEmail);
                        }
                    }
                    catch
                    {
                        // Safe catch so order response is never blocked
                    }
                });

                return resultDto;
            }
            catch
            {
                // Tự động Rollback nếu có bất kỳ lỗi nào xảy ra
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersAsync(int userId)
        {
            var orders = await _orderRepository.GetOrdersByUserAsync(userId);

            return orders.Select(ToDto);
        }

        public async Task<OrderDto?> GetOrderAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);

            if (order == null)
                return null;

            return ToDto(order);
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllOrdersAsync();

            return orders.Select(ToDto);
        }

        public async Task<bool> UpdateStatusAsync(int orderId, string status)
        {
            var allowedStatuses = new[]
            {
                "Pending",
                "Confirmed",
                "Shipping",
                "Completed",
                "Cancelled"
            };

            if (!allowedStatuses.Contains(status))
                throw new Exception("Trạng thái đơn hàng không hợp lệ.");

            return await _orderRepository.UpdateStatusAsync(orderId, status);
        }

        private static OrderDto ToDto(Order o)
        {
            return new OrderDto
            {
                OrderId = o.OrderId,
                UserId = o.UserId,
                CustomerName = o.User?.FullName,
                CustomerEmail = o.User?.Email,
                ReceiverName = o.ReceiverName,
                ReceiverPhone = o.ReceiverPhone,
                ShippingAddress = o.ShippingAddress,
                PaymentMethod = o.PaymentMethod,
                Notes = o.Notes,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                CreatedAt = o.CreatedAt,
                Items = o.OrderDetails.Select(d => new OrderDetailDto
                {
                    ProductId = d.ProductId,
                    ProductName = d.Product?.ProductName ?? "",
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    TotalPrice = d.TotalPrice
                }).ToList()
            };
        }
    }
}