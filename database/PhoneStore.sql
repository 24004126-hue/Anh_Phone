-- ==========================================================
-- PHONESTORE DATABASE SCHEMA & SEED DATA
-- Tương thích 100% với ASP.NET Core EF Core & MySQL (XAMPP)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS `PhoneStore`;
CREATE DATABASE `PhoneStore`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `PhoneStore`;

-- ----------------------------------------------------------
-- 1. XÓA CÁC BẢNG NẾU ĐÃ TỒN TẠI (Theo thứ tự khóa ngoại)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `OrderDetails`;
DROP TABLE IF EXISTS `Orders`;
DROP TABLE IF EXISTS `CartItems`;
DROP TABLE IF EXISTS `Carts`;
DROP TABLE IF EXISTS `Products`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `Categories`;
DROP TABLE IF EXISTS `Brands`;
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

-- ----------------------------------------------------------
-- 2. BẢNG LỊCH SỬ MIGRATION (EF Core Migration History)
-- ----------------------------------------------------------
CREATE TABLE `__EFMigrationsHistory` (
    `MigrationId` VARCHAR(150) NOT NULL,
    `ProductVersion` VARCHAR(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
('20260803155439_InitialCreate', '8.0.10'),
('20260804145739_AddCart', '8.0.10'),
('20260804153732_AddOrder', '8.0.10');

-- ----------------------------------------------------------
-- 3. BẢNG THƯƠNG HIỆU (Brands)
-- ----------------------------------------------------------
CREATE TABLE `Brands` (
    `BrandId` INT NOT NULL AUTO_INCREMENT,
    `BrandName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`BrandId`),
    UNIQUE KEY `UQ_Brand_Name` (`BrandName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. BẢNG DANH MỤC (Categories)
-- ----------------------------------------------------------
CREATE TABLE `Categories` (
    `CategoryId` INT NOT NULL AUTO_INCREMENT,
    `CategoryName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`CategoryId`),
    UNIQUE KEY `UQ_Category_Name` (`CategoryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. BẢNG NGƯỜI DÙNG (Users)
-- ----------------------------------------------------------
CREATE TABLE `Users` (
    `UserId` INT NOT NULL AUTO_INCREMENT,
    `FullName` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `PasswordHash` LONGTEXT NOT NULL,
    `Phone` VARCHAR(20) DEFAULT NULL,
    `Address` VARCHAR(255) DEFAULT NULL,
    `Role` VARCHAR(20) NOT NULL DEFAULT 'Customer',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`UserId`),
    UNIQUE KEY `UQ_Users_Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. BẢNG SẢN PHẨM (Products)
-- ----------------------------------------------------------
CREATE TABLE `Products` (
    `ProductId` INT NOT NULL AUTO_INCREMENT,
    `ProductName` VARCHAR(200) NOT NULL,
    `SKU` VARCHAR(50) DEFAULT NULL,
    `Price` DECIMAL(18,2) NOT NULL,
    `DiscountPrice` DECIMAL(18,2) DEFAULT NULL,
    `Quantity` INT NOT NULL DEFAULT 0,
    `Description` LONGTEXT DEFAULT NULL,
    `Thumbnail` VARCHAR(255) DEFAULT NULL,
    `Screen` VARCHAR(100) DEFAULT NULL,
    `OperatingSystem` VARCHAR(100) DEFAULT NULL,
    `FrontCamera` VARCHAR(100) DEFAULT NULL,
    `RearCamera` VARCHAR(100) DEFAULT NULL,
    `Chip` VARCHAR(100) DEFAULT NULL,
    `RAM` VARCHAR(50) DEFAULT NULL,
    `Storage` VARCHAR(50) DEFAULT NULL,
    `Battery` VARCHAR(100) DEFAULT NULL,
    `Color` VARCHAR(50) DEFAULT NULL,
    `Weight` VARCHAR(30) DEFAULT NULL,
    `Warranty` INT NOT NULL DEFAULT 12,
    `Status` VARCHAR(20) DEFAULT 'Available',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
    `BrandId` INT NOT NULL,
    `CategoryId` INT NOT NULL,
    `SoldQuantity` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`ProductId`),
    KEY `IX_Products_BrandId` (`BrandId`),
    KEY `IX_Products_CategoryId` (`CategoryId`),
    KEY `idx_products_brand_price` (`BrandId`, `Price`),
    KEY `idx_products_sold_created` (`SoldQuantity`, `CreatedAt`),
    CONSTRAINT `FK_Products_Brands_BrandId` FOREIGN KEY (`BrandId`) REFERENCES `Brands` (`BrandId`) ON DELETE CASCADE,
    CONSTRAINT `FK_Products_Categories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`CategoryId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. BẢNG GIỎ HÀNG (Carts)
-- ----------------------------------------------------------
CREATE TABLE `Carts` (
    `CartId` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    PRIMARY KEY (`CartId`),
    KEY `IX_Carts_UserId` (`UserId`),
    CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. BẢNG CHI TIẾT GIỎ HÀNG (CartItems)
-- ----------------------------------------------------------
CREATE TABLE `CartItems` (
    `CartItemId` INT NOT NULL AUTO_INCREMENT,
    `CartId` INT NOT NULL,
    `ProductId` INT NOT NULL,
    `Quantity` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`CartItemId`),
    KEY `IX_CartItems_CartId` (`CartId`),
    KEY `IX_CartItems_ProductId` (`ProductId`),
    KEY `idx_cartitems_cart_product` (`CartId`, `ProductId`),
    CONSTRAINT `FK_CartItems_Carts_CartId` FOREIGN KEY (`CartId`) REFERENCES `Carts` (`CartId`) ON DELETE CASCADE,
    CONSTRAINT `FK_CartItems_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. BẢNG ĐƠN HÀNG (Orders)
-- ----------------------------------------------------------
CREATE TABLE `Orders` (
    `OrderId` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    `ReceiverName` VARCHAR(100) DEFAULT NULL,
    `ReceiverPhone` VARCHAR(20) DEFAULT NULL,
    `ShippingAddress` VARCHAR(255) DEFAULT NULL,
    `PaymentMethod` VARCHAR(50) NOT NULL DEFAULT 'COD',
    `Notes` VARCHAR(255) DEFAULT NULL,
    `TotalAmount` DECIMAL(18,2) NOT NULL,
    `Status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`OrderId`),
    KEY `IX_Orders_UserId` (`UserId`),
    KEY `idx_orders_user_status_created` (`UserId`, `Status`, `CreatedAt`),
    CONSTRAINT `FK_Orders_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. BẢNG CHI TIẾT ĐƠN HÀNG (OrderDetails)
-- ----------------------------------------------------------
CREATE TABLE `OrderDetails` (
    `OrderDetailId` INT NOT NULL AUTO_INCREMENT,
    `OrderId` INT NOT NULL,
    `ProductId` INT NOT NULL,
    `Quantity` INT NOT NULL DEFAULT 1,
    `UnitPrice` DECIMAL(65,30) NOT NULL,
    `TotalPrice` DECIMAL(65,30) NOT NULL,
    PRIMARY KEY (`OrderDetailId`),
    KEY `IX_OrderDetails_OrderId` (`OrderId`),
    KEY `IX_OrderDetails_ProductId` (`ProductId`),
    KEY `idx_orderdetails_order_product` (`OrderId`, `ProductId`),
    CONSTRAINT `FK_OrderDetails_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderDetails_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. BẢNG MÃ LÀM MỚI PHIÊN (RefreshTokens)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `RefreshTokens` (
    `RefreshTokenId` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    `Token` VARCHAR(255) NOT NULL,
    `ExpiresAt` DATETIME(6) NOT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `IsRevoked` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`RefreshTokenId`),
    KEY `IX_RefreshTokens_UserId` (`UserId`),
    KEY `idx_refreshtokens_token` (`Token`),
    KEY `idx_refreshtokens_user_revoked` (`UserId`, `IsRevoked`),
    CONSTRAINT `FK_RefreshTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 12. BẢNG BIẾN THỂ SẢN PHẨM (ProductVariants)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProductVariants` (
    `VariantId` INT NOT NULL AUTO_INCREMENT,
    `ProductId` INT NOT NULL,
    `SKU` VARCHAR(50) NOT NULL,
    `Color` VARCHAR(50) DEFAULT NULL,
    `ColorHex` VARCHAR(20) DEFAULT NULL,
    `Storage` VARCHAR(50) DEFAULT NULL,
    `Price` DECIMAL(18,2) NOT NULL,
    `DiscountPrice` DECIMAL(18,2) DEFAULT NULL,
    `Quantity` INT NOT NULL DEFAULT 0,
    `Thumbnail` VARCHAR(255) DEFAULT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`VariantId`),
    KEY `IX_ProductVariants_ProductId` (`ProductId`),
    KEY `idx_variants_product_sku` (`ProductId`, `SKU`),
    KEY `idx_variants_product_active` (`ProductId`, `IsActive`),
    CONSTRAINT `FK_ProductVariants_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==========================================================

-- 1. Thêm thương hiệu
INSERT INTO `Brands` (`BrandId`, `BrandName`) VALUES
(1, 'Apple'),
(2, 'Samsung'),
(3, 'Xiaomi'),
(4, 'OPPO'),
(5, 'Vivo'),
(6, 'Realme'),
(7, 'ASUS ROG');

-- 2. Thêm danh mục
INSERT INTO `Categories` (`CategoryId`, `CategoryName`) VALUES
(1, 'Điện thoại Flagship'),
(2, 'Điện thoại Cận cao cấp'),
(3, 'Điện thoại Tầm trung'),
(4, 'Điện thoại Giá rẻ'),
(5, 'Gaming Phone');

-- 3. Thêm tài khoản người dùng
-- Mật khẩu Admin: admin123 (BCrypt)
-- Mật khẩu Customer: 123456 (BCrypt)
INSERT INTO `Users` (`UserId`, `FullName`, `Email`, `PasswordHash`, `Phone`, `Address`, `Role`, `CreatedAt`) VALUES
(1, 'Quản Trị Viên', 'admin@phonestore.com', '$2a$11$TBZ.1xLSa1XzOoQkJRukk.FN16mTGWGEYksPK7fw05yELTLw.kAJ2', '0901234567', 'Hà Nội, Việt Nam', 'Admin', NOW(6)),
(2, 'Nguyễn Văn Khách', 'customer@phonestore.com', '$2a$11$OSb4GhLs/ErRwMxeLnv2repUkA513sSsPQpQ9eMAwNTx8mj.fVhl.', '0912345678', 'TP. Hồ Chí Minh, Việt Nam', 'Customer', NOW(6));

-- 4. Thêm sản phẩm mẫu
INSERT INTO `Products` (
    `ProductId`, `ProductName`, `SKU`, `Price`, `DiscountPrice`, `Quantity`, 
    `Description`, `Thumbnail`, `Screen`, `OperatingSystem`, `FrontCamera`, 
    `RearCamera`, `Chip`, `RAM`, `Storage`, `Battery`, `Color`, `Weight`, 
    `Warranty`, `Status`, `BrandId`, `CategoryId`, `SoldQuantity`, `CreatedAt`
) VALUES
(
    1, 
    'iPhone 16 Pro Max 256GB', 
    'IP16PM-256-DESERT', 
    34990000.00, 
    32990000.00, 
    50, 
    'iPhone 16 Pro Max với thiết kế Titan sa mạc đẳng cấp, viền màn hình siêu mỏng, chip Apple A18 Pro mạnh mẽ vượt trội cùng nút điều khiển Camera Control hoàn toàn mới.', 
    '/images/products/iphone-16-pro-max.jpg', 
    '6.9 inch Super Retina XDR OLED 120Hz', 
    'iOS 18', 
    '12 MP TrueDepth', 
    'Chính 48 MP & Phụ 48 MP, 12 MP (Zoom 5x)', 
    'Apple A18 Pro', 
    '8GB', 
    '256GB', 
    '4685 mAh, Sạc nhanh 30W', 
    'Titan Sa Mạc', 
    '227g', 
    12, 
    'Available', 
    1, 
    1, 
    15, 
    NOW(6)
),
(
    2, 
    'iPhone 15 128GB', 
    'IP15-128-PINK', 
    19990000.00, 
    18490000.00, 
    40, 
    'iPhone 15 nổi bật với màn hình Dynamic Island, camera 48MP sắc nét và cổng sạc USB-C tiện lợi.', 
    '/images/products/iphone-15.jpg', 
    '6.1 inch Super Retina XDR OLED', 
    'iOS 17', 
    '12 MP', 
    'Chính 48 MP & Phụ 12 MP', 
    'Apple A16 Bionic', 
    '6GB', 
    '128GB', 
    '3349 mAh, Sạc 20W', 
    'Hồng Pastel', 
    '171g', 
    12, 
    'Available', 
    1, 
    2, 
    28, 
    NOW(6)
),
(
    3, 
    'Samsung Galaxy S24 Ultra 5G 256GB', 
    'SS-S24U-256-GRAY', 
    31990000.00, 
    27990000.00, 
    35, 
    'Galaxy S24 Ultra tiên phong với quyền năng Galaxy AI, khung viền Titan cứng cáp, bút S-Pen tích hợp cùng camera 200MP zoom đỉnh cao.', 
    '/images/products/samsung-galaxy-s24-ultra.jpg', 
    '6.8 inch Dynamic AMOLED 2X 120Hz', 
    'Android 14, One UI 6.1', 
    '12 MP', 
    'Chính 200 MP & Phụ 50 MP, 12 MP, 10 MP', 
    'Snapdragon 8 Gen 3 for Galaxy', 
    '12GB', 
    '256GB', 
    '5000 mAh, Sạc nhanh 45W', 
    'Xám Titan', 
    '232g', 
    12, 
    'Available', 
    2, 
    1, 
    19, 
    NOW(6)
),
(
    4, 
    'Samsung Galaxy A55 5G 128GB', 
    'SS-A55-128-BLUE', 
    9990000.00, 
    8890000.00, 
    60, 
    'Samsung Galaxy A55 5G sở hữu thiết kế viền kim loại sang trọng, camera chụp đêm sắc nét và khả năng kháng nước IP67.', 
    '/images/products/samsung-galaxy-a55.jpg', 
    '6.6 inch Super AMOLED 120Hz', 
    'Android 14, One UI 6.1', 
    '32 MP', 
    'Chính 50 MP & Phụ 12 MP, 5 MP', 
    'Exynos 1480 8 nhân', 
    '8GB', 
    '128GB', 
    '5000 mAh, Sạc 25W', 
    'Xanh Iceblue', 
    '213g', 
    12, 
    'Available', 
    2, 
    3, 
    42, 
    NOW(6)
),
(
    5, 
    'Xiaomi 14 Ultra 5G 512GB', 
    'MI-14U-512-BLACK', 
    29990000.00, 
    27490000.00, 
    20, 
    'Tuyệt tác nhiếp ảnh di động hợp tác cùng Leica, 4 ống kính 50MP cảm biến 1 inch cùng hiệu năng cực đỉnh Snapdragon 8 Gen 3.', 
    '/images/products/xiaomi-14-ultra.jpg', 
    '6.73 inch LTPO AMOLED 120Hz 2K+', 
    'Xiaomi HyperOS (Android 14)', 
    '32 MP', 
    '4 camera 50 MP Leica Summilux', 
    'Snapdragon 8 Gen 3', 
    '16GB', 
    '512GB', 
    '5000 mAh, Sạc nhanh 90W', 
    'Đen Nhám', 
    '224g', 
    18, 
    'Available', 
    3, 
    1, 
    8, 
    NOW(6)
),
(
    6, 
    'Xiaomi Redmi Note 13 Pro 4G', 
    'MI-RN13P-128-PURPLE', 
    7290000.00, 
    6490000.00, 
    80, 
    'Redmi Note 13 Pro nổi bật với camera chính 200MP siêu chi tiết, sạc nhanh Turbo 67W và màn hình AMOLED 120Hz mượt mà.', 
    '/images/products/xiaomi-redmi-note-13-pro.jpg', 
    '6.67 inch AMOLED 120Hz FHD+', 
    'MIUI 14 (Android 13)', 
    '16 MP', 
    'Chính 200 MP & Phụ 8 MP, 2 MP', 
    'MediaTek Helio G99-Ultra', 
    '8GB', 
    '128GB', 
    '5000 mAh, Sạc 67W', 
    'Tím Cầu Vồng', 
    '188g', 
    18, 
    'Available', 
    3, 
    3, 
    55, 
    NOW(6)
),
(
    7, 
    'ASUS ROG Phone 8 Pro 512GB', 
    'ROG-8P-512-BLACK', 
    29990000.00, 
    26990000.00, 
    15, 
    'Quái thú Gaming Phone với màn hình LED AniMe Vision độc đáo, hệ thống tản nhiệt GameCool 8 và tần số quét 165Hz.', 
    '/images/products/asus-rog-phone-8-pro.jpg', 
    '6.78 inch Samsung AMOLED 165Hz', 
    'Android 14, ROG UI', 
    '32 MP', 
    'Chính 50 MP Sony IMX890 & Phụ 32 MP, 13 MP', 
    'Snapdragon 8 Gen 3', 
    '16GB', 
    '512GB', 
    '5500 mAh, Sạc HyperCharge 65W', 
    'Phantom Black', 
    '225g', 
    12, 
    'Available', 
    7, 
    5, 
    12, 
    NOW(6)
),
(
    8, 
    'OPPO Reno12 5G 256GB', 
    'OPPO-R12-256-SILVER', 
    12990000.00, 
    11990000.00, 
    45, 
    'Thiết kế tương lai mỏng nhẹ, chuyên gia chân dung AI cùng khả năng xóa vật thể thông minh AI Eraser 2.0.', 
    '/images/products/oppo-reno-12.jpg', 
    '6.7 inch 3D Curved AMOLED 120Hz', 
    'ColorOS 14.1 (Android 14)', 
    '32 MP AI Portrait', 
    'Chính 50 MP Sony OIS & Phụ 8 MP, 2 MP', 
    'MediaTek Dimensity 7300-Energy', 
    '12GB', 
    '256GB', 
    '5000 mAh, Sạc SUPERVOOC 80W', 
    'Bạc Vũ Trụ', 
    '177g', 
    12, 
    'Available', 
    4, 
    2, 
    21, 
    NOW(6)
),
(
    9, 
    'Samsung Galaxy Z Fold 6 512GB', 
    'SS-ZF6-512-SILVER', 
    43990000.00, 
    40990000.00, 
    25, 
    'Tuyệt tác điện thoại gập thông minh mỏng nhẹ nhất từ trước đến nay, tích hợp trọn bộ quyền năng Galaxy AI thế hệ mới cùng Snapdragon 8 Gen 3 for Galaxy.', 
    '/images/products/samsung-galaxy-s24-ultra.jpg', 
    'Chính 7.6 inch & Phụ 6.3 inch Dynamic AMOLED 2X 120Hz', 
    'Android 14, One UI 6.1.1', 
    '10 MP & Dưới màn hình 4 MP', 
    'Chính 50 MP & Phụ 12 MP, 10 MP', 
    'Snapdragon 8 Gen 3 for Galaxy', 
    '12GB', 
    '512GB', 
    '4400 mAh, Sạc nhanh 25W & Sạc không dây', 
    'Xám Metal', 
    '239g', 
    12, 
    'Available', 
    2, 
    1, 
    9, 
    NOW(6)
),
(
    10, 
    'Samsung Galaxy Z Flip 6 256GB', 
    'SS-ZF6-256-MINT', 
    28990000.00, 
    26490000.00, 
    30, 
    'Biểu tượng thời trang gập nhỏ gọn, camera nâng cấp 50MP sắc nét, pin tăng lên 4000mAh và buồng tản nhiệt Vapor Chamber lần đầu xuất hiện.', 
    '/images/products/samsung-galaxy-a55.jpg', 
    'Chính 6.7 inch & Phụ 3.4 inch Super AMOLED 120Hz', 
    'Android 14, One UI 6.1.1', 
    '10 MP FlexCam', 
    'Chính 50 MP & Phụ 12 MP Ultra Wide', 
    'Snapdragon 8 Gen 3 for Galaxy', 
    '12GB', 
    '256GB', 
    '4000 mAh, Sạc nhanh 25W', 
    'Xanh Mint', 
    '187g', 
    12, 
    'Available', 
    2, 
    1, 
    18, 
    NOW(6)
),
(
    11, 
    'iPhone 16 Plus 128GB', 
    'IP16P-128-TEAL', 
    25990000.00, 
    24490000.00, 
    35, 
    'Màn hình lớn 6.7 inch cực đã, màu sắc phong cách mới lạ, chip Apple A18 cực mạnh hỗ trợ Apple Intelligence và thời lượng pin đột phá nhất từ trước đến nay.', 
    '/images/products/iphone-16-pro-max.jpg', 
    '6.7 inch Super Retina XDR OLED', 
    'iOS 18', 
    '12 MP TrueDepth', 
    'Chính 48 MP Fusion 2x & Phụ 12 MP Ultra Wide', 
    'Apple A18', 
    '8GB', 
    '128GB', 
    '4674 mAh, Sạc MagSafe 25W', 
    'Xanh Lưu Ly', 
    '199g', 
    12, 
    'Available', 
    1, 
    1, 
    14, 
    NOW(6)
),
(
    12, 
    'Vivo X100 Pro 5G 512GB', 
    'VIVO-X100P-512-BLACK', 
    22990000.00, 
    20990000.00, 
    20, 
    'Đỉnh cao nhiếp ảnh di động với cụm camera 50MP cảm biến 1 inch phủ lớp phủ Zeiss T*, chip xử lý ảnh Vivo V3 và vi xử lý MediaTek Dimensity 9300.', 
    '/images/products/xiaomi-14-ultra.jpg', 
    '6.78 inch LTPO AMOLED 120Hz 3000 nits', 
    'Funtouch OS 14 (Android 14)', 
    '32 MP', 
    '3 camera 50 MP Zeiss APO Floating Telephoto', 
    'MediaTek Dimensity 9300', 
    '16GB', 
    '512GB', 
    '5400 mAh, Sạc siêu tốc 100W FlashCharge', 
    'Đen Tinh Vân', 
    '225g', 
    12, 
    'Available', 
    5, 
    1, 
    7, 
    NOW(6)
),
(
    13, 
    'Realme GT 6 5G 256GB', 
    'RME-GT6-256-SILVER', 
    14990000.00, 
    13490000.00, 
    50, 
    'Kẻ hủy diệt phân khúc cận cao cấp với màn hình sáng nhất thế giới 6000 nits, chip Snapdragon 8s Gen 3 và sạc siêu nhanh 120W đầy trong 28 phút.', 
    '/images/products/asus-rog-phone-8-pro.jpg', 
    '6.78 inch 8T LTPO AMOLED 120Hz 6000 nits', 
    'Realme UI 5.0 (Android 14)', 
    '32 MP Sony', 
    'Chính 50 MP Sony LYT-808 OIS & Phụ 50 MP, 8 MP', 
    'Snapdragon 8s Gen 3', 
    '12GB', 
    '256GB', 
    '5500 mAh, Sạc SUPERVOOC 120W', 
    'Bạc Ánh Kim', 
    '199g', 
    12, 
    'Available', 
    6, 
    2, 
    26, 
    NOW(6)
);

-- 5. Thêm biến thể sản phẩm mẫu (ProductVariants)
INSERT INTO `ProductVariants` (`VariantId`, `ProductId`, `SKU`, `Color`, `ColorHex`, `Storage`, `Price`, `DiscountPrice`, `Quantity`, `Thumbnail`, `IsActive`) VALUES
-- iPhone 16 Pro Max (ProductId = 1)
(1, 1, 'IP16PM-256-DESERT', 'Titan Sa Mạc', '#C5A880', '256GB', 34990000.00, 32990000.00, 20, '/images/products/iphone-16-pro-max.jpg', 1),
(2, 1, 'IP16PM-256-NATURAL', 'Titan Tự Nhiên', '#9E9A95', '256GB', 34990000.00, 32990000.00, 15, '/images/products/iphone-16-pro-max.jpg', 1),
(3, 1, 'IP16PM-512-DESERT', 'Titan Sa Mạc', '#C5A880', '512GB', 40990000.00, 38990000.00, 10, '/images/products/iphone-16-pro-max.jpg', 1),
(4, 1, 'IP16PM-1TB-BLACK', 'Titan Đen', '#3B3B3D', '1TB', 46990000.00, 44990000.00, 5, '/images/products/iphone-16-pro-max.jpg', 1),

-- Galaxy S24 Ultra (ProductId = 2)
(5, 2, 'SS24U-256-GRAY', 'Titan Xám', '#7D7F7D', '256GB', 31990000.00, 26490000.00, 25, '/images/products/samsung-s24-ultra.jpg', 1),
(6, 2, 'SS24U-512-BLACK', 'Titan Đen', '#2A2B2E', '512GB', 36990000.00, 31490000.00, 15, '/images/products/samsung-s24-ultra.jpg', 1),
(7, 2, 'SS24U-512-YELLOW', 'Titan Vàng', '#E7DCB9', '512GB', 36990000.00, 31490000.00, 8, '/images/products/samsung-s24-ultra.jpg', 1),

-- Xiaomi 14 Ultra (ProductId = 3)
(8, 3, 'MI14U-512-BLACK', 'Đen Da Thuần Chay', '#1F1F1F', '512GB', 32990000.00, 28990000.00, 18, '/images/products/xiaomi-14-ultra.jpg', 1),
(9, 3, 'MI14U-512-WHITE', 'Trắng Gốm', '#F5F5F7', '512GB', 32990000.00, 28990000.00, 12, '/images/products/xiaomi-14-ultra.jpg', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- HOÀN THÀNH TẠO CƠ SỞ DỮ LIỆU & DỮ LIỆU MẪU
-- ==========================================================
