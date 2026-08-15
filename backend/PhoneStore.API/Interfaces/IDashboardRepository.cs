using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface IDashboardRepository
    {
        Task<DashboardDto> GetDashboardAsync();
    }
}