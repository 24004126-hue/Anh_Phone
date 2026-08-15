# ⚡ PhoneStore - Modern Flagship E-Commerce Platform

<p align="center">
  <img src="frontend/phonestore-client/public/images/hero/iphone16-desert.png" alt="PhoneStore Banner" width="220" />
</p>

<p align="center">
  <strong>Hệ thống Thương mại Điện tử Bán lẻ Smartphone Flagship & Phụ kiện Công nghệ Cao cấp</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET%208-Web%20API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 8" />
  <img src="https://img.shields.io/badge/React%2019-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Cloudinary-Image%20CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Tests-7%20Passed-brightgreen?style=for-the-badge&logo=xunit" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Tổng Quan Dự Án (Project Overview)

**PhoneStore** là nền tảng thương mại điện tử chuyên nghiệp được thiết kế theo tiêu chuẩn công nghiệp hiện đại, mang phong cách **Luxury Dark Theme** tối giản và sang trọng (chuẩn Apple / Samsung Flagship). 

Dự án kết hợp kiến trúc **Clean Architecture (.NET 8 Web API)** ở backend và **React 19 + Vite SPA** ở frontend, trang bị đầy đủ các tính năng bảo mật, dịch vụ lưu trữ đám mây, thông báo hóa đơn tự động và trải nghiệm mua sắm mượt mà trên mọi thiết bị.

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 🛍️ 1. Khách Hàng (Customer Experience)
- **3D Hero Banner Tương Tác**:
  - Trình diễn Studio Render siêu nét (iPhone 16 Pro Max 4 màu Titan Sa Mạc, Tự Nhiên, Đen, Trắng).
  - Tự do nghiêng theo chuột (3D Mouse Parallax Tilt Physics) và đổi màu tức thì.
- **Thanh Header Động (Dynamic Frosted Glass Navbar)**:
  - Hiệu ứng kính mờ (Backdrop Blur) tự động chuyển đổi mượt mà khi cuộn trang.
- **PWA (Progressive Web App)**:
  - Cài đặt ứng dụng 1-chạm lên màn hình chính (Android/iOS/Desktop).
  - Hỗ trợ Service Worker và bộ nhớ đệm Offline.
- **E-Commerce Tiện Ích Đỉnh Cao**:
  - 🛒 **Giỏ hàng thời gian thực & Mua kèm combo phụ kiện** trợ giá hấp dẫn.
  - 🎟️ **Hệ thống Voucher & Khuyến mãi tự động** tính toán giảm giá tức thì.
  - 🔍 **Tra cứu tiến độ đơn hàng 4 bước (Order Tracking Stepper)** trực quan.
  - ⚖️ **So sánh thông số kỹ thuật 2 máy cạnh nhau (Compare Bar)**.
  - 💬 **Trợ lý mua sắm AI (Smart AI Shopping Assistant)** tư vấn chọn máy theo nhu cầu.
  - ⭐ **Đánh giá & Review sản phẩm** theo số sao và bình luận thực tế.

### 🛡️ 2. Quản Trị Viên (Admin Portal)
- **Báo cáo Thống kê Doanh thu (Analytics Dashboard)**:
  - Biểu đồ biến động doanh thu, tổng đơn đặt hàng, top sản phẩm bán chạy.
- **Quản lý Sản phẩm & Biến thể (Product & Variants Management)**:
  - Thêm, sửa, xóa, tìm kiếm, lọc theo Brand/Category.
  - **Tải ảnh trực tiếp lên Cloudinary CDN** vĩnh viễn với tính năng nén tự động.
- **Quản lý Đơn hàng & Cập nhật Trạng thái (Order Lifecycle)**:
  - Xem chi tiết đơn hàng, in hóa đơn, đổi trạng thái (*Pending -> Processing -> Shipped -> Delivered -> Cancelled*).
- **Quản lý Người Dùng & Phân quyền RBAC (User Role Management)**.
- **Quản lý Danh mục & Thương hiệu (Categories & Brands)**.

### 🔒 3. Bảo Mật & Hạ Tầng Backend (.NET 8 Clean Architecture)
- **JWT Authentication 2 Tầng**: Access Token ngắn hạn + **Silent Auto-Refresh Token** tự động cấp phát lại khi hết hạn ở `axiosClient`.
- **Hệ thống Gửi Email Hóa Đơn Tự Động (e-Invoice Service)**:
  - Tự động tạo và gửi email hóa đơn điện tử HTML sang trọng cho khách ngay sau khi đặt hàng thành công qua **MailKit / Gmail SMTP / SendGrid**.
- **ASP.NET Core Rate Limiting**: Chống spam, brute-force và bảo vệ API khỏi tấn công DDoS.
- **OWASP Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Kiểm Thử Tự Động (xUnit & Moq)**: Bộ test suite kiểm thử toàn diện logic xác thực, lưu trữ và thanh toán.

---

## 🏗️ Sơ Đồ Kiến Trúc Hệ Thống (System Architecture)

```mermaid
graph TD
    subgraph Client Layer
        A[React 19 + Vite SPA]
        A --> A1[Luxury UI & 3D Hero Parallax]
        A --> A2[PWA Service Worker]
        A --> A3[Axios with Auto-Refresh Token Interceptor]
    end

    subgraph API Gateway & Security Layer
        B[ASP.NET Core 8 Web API]
        B --> B1[Rate Limiting Middleware]
        B --> B2[JWT Bearer Authentication]
        B --> B3[CORS Policy & OWASP Headers]
    end

    subgraph Service & Repository Layer
        C[Business Logic Services]
        C --> C1[OrderService & ACID Transactions]
        C --> C2[EmailService MailKit HTML Invoice]
        C --> C3[CloudinaryStorageService CDN]
        C --> C4[AuthService & BCrypt Password Hash]
    end

    subgraph Data & Cloud Infrastructure
        D[(MySQL Database)]
        E[Cloudinary Image Cloud]
        F[Gmail / SendGrid SMTP]
    end

    A -->|HTTPS JSON REST API| B
    B --> C
    C --> D
    C --> E
    C --> F
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành Phần | Công Nghệ / Thư Viện |
| :--- | :--- |
| **Frontend** | React 19, Vite, Bootstrap 5, React Icons, Lucide Icons, Three.js, Canvas-Confetti, PWA Service Worker |
| **Backend** | C# .NET 8 Web API, Entity Framework Core 8, Pomelo MySQL Provider |
| **Bảo Mật** | JWT (JSON Web Token), BCrypt.Net, ASP.NET Core Rate Limiting |
| **Lưu Trữ Ảnh** | Cloudinary DotNet SDK (`CloudinaryDotNet`) + Local Fallback |
| **Gửi Email** | MailKit, MimeKit (SMTP / TLS 1.3) |
| **Database** | MySQL 8.0 / MariaDB (XAMPP Compatible) |
| **Testing** | xUnit, Moq |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### 1. Yêu Cầu Môi Trường (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [XAMPP](https://www.apachefriends.org/) (hoặc MySQL Server đang chạy ở cổng `3306`)
- [Git](https://git-scm.com/)

---

### 2. Thiết Lập Cơ Sở Dữ Liệu (Database Setup)
1. Khởi động **MySQL** trong bảng điều khiển XAMPP.
2. Mở phpMyAdmin (`http://localhost/phpmyadmin`), tạo cơ sở dữ liệu mới tên: `phonestore`.
3. Import file `database/phonestore.sql` vào cơ sở dữ liệu vừa tạo.

---

### 3. Khởi Chạy Backend (.NET 8 API)
```bash
cd backend/PhoneStore.API
dotnet restore
dotnet build
dotnet run
```
> API sẽ khởi chạy tại: `http://localhost:5055`  
> Tài liệu Swagger UI: `http://localhost:5055/swagger`

---

### 4. Khởi Chạy Frontend (React Vite)
```bash
cd frontend/phonestore-client
npm install
npm run dev
```
> Ứng dụng web sẽ mở tại: `http://localhost:5173`

---

### 5. Chạy Bộ Kiểm Thử Tự Động (Run Unit Tests)
```bash
cd backend
dotnet test PhoneStore.Tests/PhoneStore.Tests.csproj
```

---

## ⚙️ Cấu Hình Môi Trường (Environment Variables)

### Backend: `backend/PhoneStore.API/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;database=phonestore;user=root;password=;"
  },
  "Jwt": {
    "Key": "PhoneStore@2026_SuperSecretKey_123456789",
    "Issuer": "PhoneStore.API",
    "Audience": "PhoneStore.Client",
    "ExpireMinutes": 120
  },
  "EmailSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "EnableSsl": true,
    "SenderName": "PhoneStore Official",
    "SenderEmail": "your-email@gmail.com",
    "Username": "your-email@gmail.com",
    "Password": "your-16-digit-app-password"
  },
  "CloudinarySettings": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  }
}
```

### Frontend: `frontend/phonestore-client/.env`
```env
VITE_API_BASE_URL=http://localhost:5055/api
```

---

## 👥 Tài Khoản Trải Nghiệm Mặc Định (Demo Accounts)

| Vai trò (Role) | Email | Mật khẩu (Password) |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@gmail.com` | `admin123` |
| **Khách hàng (Customer)** | `customer@gmail.com` | `customer123` |

---

## 📄 Bản Quyền (License)
Dự án được phân phối dưới giấy phép **MIT License**. Mọi chi tiết vui lòng xem file [LICENSE](LICENSE).

<p align="center">
  Made with ❤️ by <strong>24004126-hue</strong>
</p>
