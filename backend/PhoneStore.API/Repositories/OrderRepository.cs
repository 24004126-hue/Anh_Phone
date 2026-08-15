using Microsoft.EntityFrameworkCore;
using PhoneStore.API.Data;
using PhoneStore.API.Interfaces;
using PhoneStore.API.Models;

namespace PhoneStore.API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<OrderDetail> CreateOrderDetailAsync(
            OrderDetail detail)
        {
            _context.OrderDetails.Add(detail);

            await _context.SaveChangesAsync();

            return detail;
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserAsync(
            int userId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(
            int orderId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.Product)
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    o => o.OrderId == orderId);
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.Product)
                .OrderByDescending(o => o.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> UpdateStatusAsync(
            int orderId,
            string status)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(
                    o => o.OrderId == orderId);

            if (order == null)
                return false;

            order.Status = status;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateOrderAsync(Order order)
        {
            _context.Orders.Update(order);

            await _context.SaveChangesAsync();
        }
    }
}