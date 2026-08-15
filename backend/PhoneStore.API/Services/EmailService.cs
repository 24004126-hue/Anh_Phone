using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using PhoneStore.API.DTOs;
using PhoneStore.API.Interfaces;
using System.Globalization;

namespace PhoneStore.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            try
            {
                var host = _configuration["EmailSettings:Host"];
                var portStr = _configuration["EmailSettings:Port"];
                var enableSsl = bool.Parse(_configuration["EmailSettings:EnableSsl"] ?? "true");
                var senderName = _configuration["EmailSettings:SenderName"] ?? "PhoneStore Official";
                var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "noreply.phonestore.vn@gmail.com";
                var username = _configuration["EmailSettings:Username"];
                var password = _configuration["EmailSettings:Password"];

                if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                {
                    _logger.LogWarning("EmailSettings are not configured (Username/Password empty). Simulated sending email to {Email} with subject '{Subject}'", toEmail, subject);
                    return true;
                }

                int port = int.TryParse(portStr, out var p) ? p : 587;

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress(toEmail, toEmail));
                message.Subject = subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlContent
                };
                message.Body = builder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(host, port, enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);
                await client.AuthenticateAsync(username, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Successfully sent email to {Email} with subject '{Subject}'", toEmail, subject);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}: {Message}", toEmail, ex.Message);
                return false;
            }
        }

        public async Task<bool> SendOrderInvoiceEmailAsync(OrderDto order, string recipientEmail)
        {
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                _logger.LogWarning("Recipient email is empty for order #{OrderId}. Skipped sending invoice email.", order.OrderId);
                return false;
            }

            var vnCulture = new CultureInfo("vi-VN");
            var formattedTotal = order.TotalAmount.ToString("#,##0", vnCulture) + " đ";
            var orderDate = order.CreatedAt.ToString("HH:mm - dd/MM/yyyy");

            var itemsHtml = "";
            if (order.Items != null && order.Items.Any())
            {
                foreach (var item in order.Items)
                {
                    var price = item.UnitPrice.ToString("#,##0", vnCulture) + " đ";
                    var subtotal = item.TotalPrice.ToString("#,##0", vnCulture) + " đ";
                    itemsHtml += $@"
                        <tr style='border-bottom: 1px solid #e2e8f0;'>
                            <td style='padding: 12px 10px; font-weight: 600; color: #1e293b;'>{item.ProductName}</td>
                            <td style='padding: 12px 10px; text-align: center; color: #64748b;'>{item.Quantity}</td>
                            <td style='padding: 12px 10px; text-align: right; color: #64748b;'>{price}</td>
                            <td style='padding: 12px 10px; text-align: right; font-weight: 700; color: #2563eb;'>{subtotal}</td>
                        </tr>";
                }
            }

            var htmlTemplate = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }}
        .header {{ background: linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e293b 100%); color: #ffffff; padding: 30px 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; letter-spacing: -0.5px; }}
        .header p {{ margin: 8px 0 0 0; color: #94a3b8; font-size: 14px; }}
        .content {{ padding: 24px; }}
        .order-meta {{ background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; }}
        .order-meta-row {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }}
        .table-wrap {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
        .table-wrap th {{ background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #e2e8f0; }}
        .total-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: right; margin-bottom: 24px; }}
        .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⚡ PhoneStore Official</h1>
            <p>Hóa Đơn Điện Tử Đặt Hàng Thành Công</p>
        </div>
        <div class='content'>
            <p style='font-size: 15px; color: #334155;'>Xin chào <strong>{order.ReceiverName}</strong>,</p>
            <p style='font-size: 14px; color: #64748b; line-height: 1.5;'>Cảm ơn bạn đã tin tưởng mua sắm tại PhoneStore! Đơn hàng của bạn đã được tiếp nhận và đang được đóng gói giao hỏa tốc.</p>
            
            <div class='order-meta'>
                <div style='margin-bottom: 6px; font-size: 13px;'><strong>Mã đơn hàng:</strong> <span style='color: #2563eb; font-weight: 700;'>#DH{order.OrderId}</span></div>
                <div style='margin-bottom: 6px; font-size: 13px;'><strong>Thời gian đặt:</strong> {orderDate}</div>
                <div style='margin-bottom: 6px; font-size: 13px;'><strong>Người nhận:</strong> {order.ReceiverName} - {order.ReceiverPhone}</div>
                <div style='margin-bottom: 6px; font-size: 13px;'><strong>Địa chỉ giao:</strong> {order.ShippingAddress}</div>
                <div style='margin-bottom: 0px; font-size: 13px;'><strong>Thanh toán:</strong> <span style='background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 99px; font-weight: 600; font-size: 12px;'>{order.PaymentMethod}</span></div>
            </div>

            <table class='table-wrap'>
                <thead>
                    <tr>
                        <th style='text-align: left;'>Sản phẩm</th>
                        <th style='text-align: center;'>SL</th>
                        <th style='text-align: right;'>Đơn giá</th>
                        <th style='text-align: right;'>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                </tbody>
            </table>

            <div class='total-box'>
                <span style='font-size: 14px; color: #64748b; margin-right: 12px;'>Tổng thanh toán:</span>
                <span style='font-size: 20px; font-weight: 800; color: #ef4444;'>{formattedTotal}</span>
            </div>

            <div style='background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; font-size: 13px; color: #166534;'>
                🛡️ <strong>Cam kết từ PhoneStore:</strong> 100% Máy chính hãng VN/A • Bảo hành 12 tháng • 1 đổi 1 trong 30 ngày nếu có lỗi từ nhà sản xuất.
            </div>
        </div>
        <div class='footer'>
            <p style='margin: 0 0 6px 0;'>Hotline hỗ trợ 24/7: <strong>1800.6868</strong> • Email: support@phonestore.vn</p>
            <p style='margin: 0;'>© 2026 PhoneStore Co., Ltd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            var subject = $"[PhoneStore] Xác nhận đơn hàng #{order.OrderId} thành công ({formattedTotal})";
            return await SendEmailAsync(recipientEmail, subject, htmlTemplate);
        }
    }
}
