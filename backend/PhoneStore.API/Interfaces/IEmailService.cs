using PhoneStore.API.DTOs;

namespace PhoneStore.API.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string htmlContent);
        Task<bool> SendOrderInvoiceEmailAsync(OrderDto order, string recipientEmail);
    }
}
