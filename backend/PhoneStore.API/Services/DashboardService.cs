using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;

namespace PhoneStore.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardService(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            return await _dashboardRepository.GetDashboardAsync();
        }
    }
}