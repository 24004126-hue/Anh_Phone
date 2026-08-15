using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneStore.API.Interfaces;

namespace PhoneStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/Dashboard
        // Chỉ Admin được xem Dashboard
        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _dashboardService.GetDashboardAsync();

            return Ok(result);
        }
    }
}