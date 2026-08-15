using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardAsync();
    }
}