using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CheckoutAsync(CreateOrderDto dto);

        Task<IEnumerable<OrderDto>> GetOrdersAsync(int userId);

        Task<OrderDto?> GetOrderAsync(int orderId);

        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();

        Task<bool> UpdateStatusAsync(
            int orderId,
            string status);
    }
}