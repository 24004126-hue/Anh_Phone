using PhoneStore.API.Models;

namespace PhoneStore.API.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(Order order);

        Task<OrderDetail> CreateOrderDetailAsync(
            OrderDetail detail);

        Task<IEnumerable<Order>> GetOrdersByUserAsync(
            int userId);

        Task<Order?> GetOrderByIdAsync(
            int orderId);

        Task<IEnumerable<Order>> GetAllOrdersAsync();

        Task<bool> UpdateStatusAsync(
            int orderId,
            string status);

        Task SaveChangesAsync();

        Task UpdateOrderAsync(Order order);
    }
}