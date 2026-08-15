namespace PhoneStore.API.DTOs
{
    public class DashboardDto
    {
        public int TotalProducts { get; set; }

        public int TotalOrders { get; set; }

        public int TotalUsers { get; set; }

        public decimal TotalRevenue { get; set; }

        public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();

        public List<BrandShareDto> BrandShares { get; set; } = new();

        public OrderStatusCountDto StatusDistribution { get; set; } = new();

        public List<TopProductDto> TopSellingProducts { get; set; } = new();
    }

    public class MonthlyRevenueDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class BrandShareDto
    {
        public string BrandName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public int SoldCount { get; set; }
        public decimal TotalValue { get; set; }
    }

    public class OrderStatusCountDto
    {
        public int Pending { get; set; }
        public int Confirmed { get; set; }
        public int Shipping { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Thumbnail { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int SoldQuantity { get; set; }
        public decimal Revenue { get; set; }
    }
}