-- ==========================================================
-- PHONESTORE AIVEN CLOUD DATABASE SCHEMA & SEED DATA (49 SẢN PHẨM)
-- Sử dụng trực tiếp trên Aiven Web Console hoặc DBeaver / HeidiSQL
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. XÓA CÁC BẢNG NẾU ĐÃ TỒN TẠI
DROP TABLE IF EXISTS `OrderDetails`;
DROP TABLE IF EXISTS `Orders`;
DROP TABLE IF EXISTS `CartItems`;
DROP TABLE IF EXISTS `Carts`;
DROP TABLE IF EXISTS `ProductVariants`;
DROP TABLE IF EXISTS `RefreshTokens`;
DROP TABLE IF EXISTS `Products`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `Categories`;
DROP TABLE IF EXISTS `Brands`;
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

-- 2. BẢNG LỊCH SỬ MIGRATION
CREATE TABLE `__EFMigrationsHistory` (
    `MigrationId` VARCHAR(150) NOT NULL,
    `ProductVersion` VARCHAR(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
('20260803155439_InitialCreate', '8.0.10'),
('20260804145739_AddCart', '8.0.10'),
('20260804153732_AddOrder', '8.0.10');

-- 3. BẢNG THƯƠNG HIỆU (Brands)
CREATE TABLE `Brands` (
    `BrandId` INT NOT NULL AUTO_INCREMENT,
    `BrandName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`BrandId`),
    UNIQUE KEY `UQ_Brand_Name` (`BrandName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG DANH MỤC (Categories)
CREATE TABLE `Categories` (
    `CategoryId` INT NOT NULL AUTO_INCREMENT,
    `CategoryName` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`CategoryId`),
    UNIQUE KEY `UQ_Category_Name` (`CategoryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG NGƯỜI DÙNG (Users)
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

-- 6. BẢNG SẢN PHẨM (Products)
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

-- 7. BẢNG GIỎ HÀNG (Carts)
CREATE TABLE `Carts` (
    `CartId` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    PRIMARY KEY (`CartId`),
    KEY `IX_Carts_UserId` (`UserId`),
    CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG CHI TIẾT GIỎ HÀNG (CartItems)
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

-- 9. BẢNG ĐƠN HÀNG (Orders)
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

-- 10. BẢNG CHI TIẾT ĐƠN HÀNG (OrderDetails)
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

-- 11. BẢNG MÃ LÀM MỚI PHIÊN (RefreshTokens)
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

-- 12. BẢNG BIẾN THỂ SẢN PHẨM (ProductVariants)
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
(4, 'Asus'),
(5, 'Oppo'),
(6, 'Vivo'),
(7, 'Realme'),
(8, 'Nubia');

-- 2. Thêm danh mục
INSERT INTO `Categories` (`CategoryId`, `CategoryName`) VALUES
(1, 'iPhone'),
(2, 'Flagship Android'),
(3, 'Gaming Phone'),
(4, 'Smartphone Tầm Trung'),
(5, 'Smartphone Màn Hình Gập'),
(6, 'Phụ Kiện Chính Hãng');

-- 3. Thêm tài khoản người dùng mặc định
INSERT INTO `Users` (`UserId`, `FullName`, `Email`, `PasswordHash`, `Phone`, `Address`, `Role`, `CreatedAt`) VALUES
(1, 'Quản Trị Viên', 'admin@gmail.com', '$2a$11$TBZ.1xLSa1XzOoQkJRukk.FN16mTGWGEYksPK7fw05yELTLw.kAJ2', '0988888888', 'Trụ sở PhoneStore, Hoàn Kiếm, Hà Nội', 'Admin', NOW(6)),
(2, 'Khách Hàng Mẫu', 'customer@gmail.com', '$2a$11$OSb4GhLs/ErRwMxeLnv2repUkA513sSsPQpQ9eMAwNTx8mj.fVhl.', '0977777777', '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', 'Customer', NOW(6));

-- 4. Thêm 49 sản phẩm theo ảnh Img_Iphone & MobileCity
INSERT INTO `Products` (
    `ProductId`, `ProductName`, `SKU`, `Price`, `DiscountPrice`, `Quantity`, 
    `Description`, `Thumbnail`, `Screen`, `OperatingSystem`, `FrontCamera`, 
    `RearCamera`, `Chip`, `RAM`, `Storage`, `Battery`, `Color`, `Weight`, 
    `Warranty`, `Status`, `BrandId`, `CategoryId`, `SoldQuantity`, `CreatedAt`
) VALUES
(1, 'iPhone 12 Mini 64GB', 'AP-IP12M-64', 7990000.00, 7490000.00, 30, 'Thiết kế nhỏ gọn vừa lòng bàn tay, màn hình OLED rực rỡ và chip A14 Bionic mạnh mẽ.', '/images/products/apple-iphone-12-mini-xanh-blue-1.jpg.webp', '5.4 inch Super Retina XDR OLED', 'iOS 17', '12MP TrueDepth', '12MP + 12MP Ultra Wide', 'Apple A14 Bionic (5nm)', '4GB', '64GB', '2227 mAh, Sạc nhanh 20W', 'Xanh Blue', '135g', 12, 'Available', 1, 1, 95, NOW(6)),
(2, 'Asus ROG Phone 3 512GB', 'AS-ROG3-512', 5990000.00, 5490000.00, 20, 'Gaming phone huyền thoại pin siêu trâu 6000mAh, màn hình 144Hz và loa kép phía trước cực đỉnh.', '/images/products/asus-rog-phone-3.jpg.webp', '6.59 inch AMOLED 144Hz HDR10+', 'Android 12, ROG UI', '24MP', '64MP Sony IMX686 + 13MP + 5MP', 'Snapdragon 865+ (7nm+)', '12GB', '512GB', '6000 mAh, HyperCharge 30W', 'Black Glare', '240g', 12, 'Available', 4, 3, 68, NOW(6)),
(3, 'Asus ROG Phone 5 128GB Đen', 'AS-ROG5-128', 9990000.00, 8990000.00, 25, 'Thiết kế hầm hố chuẩn gaming thủ, nút cảm ứng siêu âm AirTrigger 5 và sạc nhanh 65W.', '/images/products/asus-rog-phone-5-den.jpeg.webp', '6.78 inch AMOLED 144Hz 1 tỷ màu', 'Android 13, ROG UI', '24MP', '64MP + 13MP + 5MP Macro', 'Snapdragon 888 5G (5nm)', '12GB', '128GB', '6000 mAh (Dual 3000mAh), Quick Charge 65W', 'Phantom Black', '238g', 12, 'Available', 4, 3, 84, NOW(6)),
(4, 'Asus ROG Phone 6 Pro 512GB', 'AS-ROG6P-512', 13990000.00, 12490000.00, 20, 'Màn hình phụ ma trận ROG Vision độc quyền phía sau, tần số quét 165Hz siêu mượt và RAM 18GB.', '/images/products/asus-rog-phone-6-pro-22.jpg.webp', '6.78 inch AMOLED 165Hz ROG Vision OLED phụ', 'Android 14, ROG UI', '12MP Sony IMX663', '50MP Sony IMX766 + 13MP + 5MP', 'Snapdragon 8+ Gen 1 (4nm)', '18GB', '512GB', '6000 mAh, Sạc siêu tốc 65W', 'Storm White', '239g', 12, 'Available', 4, 3, 55, NOW(6)),
(5, 'Asus ROG Phone 8 256GB Đen', 'AS-ROG8-256', 19990000.00, 18990000.00, 30, 'Kháng nước IP68 đầu tiên trên dòng ROG, camera chống rung Gimbal 6 trục và viền màn hình siêu mỏng.', '/images/products/asus-rog-phone-8-den.jpg.webp', '6.78 inch Samsung E6 AMOLED 165Hz LTPO', 'Android 14, ROG UI', '32MP RGBW', '50MP Sony IMX890 Gimbal OIS + 32MP Tele 3x + 13MP', 'Snapdragon 8 Gen 3 (4nm)', '16GB', '256GB', '5500 mAh, Quick Charge 65W + Không dây 15W', 'Phantom Black', '225g', 12, 'Available', 4, 3, 40, NOW(6)),
(6, 'Asus Zenfone 12 Ultra 512GB Sage Green', 'AS-ZF12U-512', 22990000.00, 21490000.00, 25, 'Thiết kế thanh lịch màu xanh Sage cao cấp, hiệu năng Snapdragon 8 Elite đỉnh cao thế hệ mới.', '/images/products/asus-zenfone-12-ultra-sage-green.jpg.webp', '6.78 inch LTPO AMOLED 144Hz FHD+', 'Android 15, ZenUI', '32MP', '50MP Sony LYT-808 OIS + 32MP Tele + 13MP', 'Snapdragon 8 Elite (3nm)', '16GB', '512GB', '5500 mAh, Sạc nhanh 65W', 'Sage Green', '220g', 12, 'Available', 4, 2, 32, NOW(6)),
(7, 'Xiaomi 17 Pro Max 512GB Xanh Lá Titanium', 'MI-17PM-512', 23990000.00, 21990000.00, 35, 'Ống kính Leica Summilux huyền thoại, dung lượng pin khủng 6100mAh với công nghệ pin Silicon-Carbon.', '/images/products/danh-gia-xiaomi-17-pro-max-000-5.jpg', '6.73 inch 2K+ LTPO AMOLED 120Hz 4000 nits', 'Xiaomi HyperOS 2.0', '32MP', '50MP Light Hunter 900 + 50MP Leica 5x Tele + 50MP Ultra Wide', 'Snapdragon 8 Elite (3nm)', '16GB', '512GB', '6100 mAh Si/C, Sạc HyperCharge 120W', 'Xanh Titanium', '219g', 12, 'Available', 3, 2, 75, NOW(6)),
(8, 'iPhone 12 Pro Max 128GB Xanh Pacific', 'AP-IP12PM-128', 13990000.00, 12990000.00, 30, 'Khung thép không gỉ bóng bẩy, màu xanh Pacific Blue đẳng cấp và cảm biến chống rung sensor-shift.', '/images/products/iphone-12-pro-max-xanh.jpg.webp', '6.7 inch Super Retina XDR OLED', 'iOS 17', '12MP TrueDepth', '12MP + 12MP + 12MP LiDAR Scanner', 'Apple A14 Bionic (5nm)', '6GB', '128GB', '3687 mAh, Sạc nhanh 20W', 'Pacific Blue', '228g', 12, 'Available', 1, 1, 110, NOW(6)),
(9, 'iPhone 13 Mini 128GB Hồng Pastel', 'AP-IP13M-128-PINK', 12490000.00, 11490000.00, 25, 'Màu hồng nữ tính siêu dễ thương, thời lượng pin nâng cấp vượt trội và camera chéo độc đáo.', '/images/products/iphone-13-mini-hong.jpg.webp', '5.4 inch Super Retina XDR OLED', 'iOS 18', '12MP TrueDepth', '12MP Kép chéo Sensor-Shift OIS', 'Apple A15 Bionic (5nm)', '4GB', '128GB', '2438 mAh, Sạc nhanh 20W', 'Hồng Pastel', '141g', 12, 'Available', 1, 1, 92, NOW(6)),
(10, 'iPhone 13 Pro 128GB Xanh Sierra', 'AP-IP13P-128-SIERRA', 15990000.00, 14490000.00, 25, 'Màn hình 120Hz ProMotion đầu tiên của Apple, màu xanh Sierra Blue thanh thoát và camera chụp macro ấn tượng.', '/images/products/iphone-13-pro-xanh.jpg.webp', '6.1 inch Super Retina XDR ProMotion 120Hz', 'iOS 18', '12MP', '12MP + 12MP + 12MP Tele 3x LiDAR', 'Apple A15 Bionic 5 GPU Core', '6GB', '128GB', '3095 mAh', 'Sierra Blue', '204g', 12, 'Available', 1, 1, 105, NOW(6)),
(11, 'iPhone 14 Max 128GB', 'AP-IP14MAX-128', 16990000.00, 15990000.00, 30, 'Màn hình lớn 6.7 inch sắc nét, thời lượng pin sử dụng liên tục lên đến hơn 26 giờ xem video.', '/images/products/iphone-14-max-2.jpg', '6.7 inch Super Retina XDR OLED', 'iOS 18', '12MP Autofocus', '12MP + 12MP Photonic Engine', 'Apple A15 Bionic 5 GPU', '6GB', '128GB', '4323 mAh, Sạc nhanh 20W', 'Starlight', '203g', 12, 'Available', 1, 1, 70, NOW(6)),
(12, 'iPhone 14 Plus 128GB Tím Mộng Mơ', 'AP-IP14P-128-PURPLE', 18990000.00, 17490000.00, 35, 'Sắc tím thời thượng, công nghệ Photonic Engine chụp đêm siêu sáng và tính năng phát hiện va chạm an toàn.', '/images/products/iphone-14-plus-tim.jpg.webp', '6.7 inch Super Retina XDR OLED Ceramic Shield', 'iOS 18', '12MP', '12MP Kép chống rung cảm biến', 'Apple A15 Bionic (5nm)', '6GB', '128GB', '4323 mAh', 'Tím Mộng Mơ', '203g', 12, 'Available', 1, 1, 88, NOW(6)),
(13, 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', 'AP-IP15PM-256-NAT', 29990000.00, 28990000.00, 40, 'Khung viền Titan siêu nhẹ cao cấp, chip A17 Pro chơi game ray tracing mượt mà và ống kính tiềm vọng zoom quang 5x.', '/images/products/iphone-15-pro-max-titan-tu-nhien.jpg.webp', '6.7 inch Super Retina XDR OLED 120Hz Dynamic Island', 'iOS 18', '12MP TrueDepth', '48MP + 12MP + 12MP Tetraprism 5x Telephoto', 'Apple A17 Pro (3nm)', '8GB', '256GB', '4422 mAh, Cổng Type-C 10Gbps', 'Titan Tự Nhiên', '221g', 12, 'Available', 1, 1, 145, NOW(6)),
(14, 'iPhone 16 Plus 128GB Xanh Lưu Ly', 'AP-IP16PLUS-128-BLUE', 25990000.00, 24490000.00, 35, 'Hỗ trợ Apple Intelligence thông minh, nút Điều Khiển Camera cảm ứng lực hoàn toàn mới.', '/images/products/iphone-16-plus-xanh-luu-ly.jpg.webp', '6.7 inch Super Retina XDR OLED 2000 nits', 'iOS 18, Apple Intelligence', '12MP', '48MP Fusion 2x + 12MP Macro', 'Apple A18 (3nm)', '8GB', '128GB', '4674 mAh, Nút Camera Control', 'Xanh Lưu Ly (Ultramarine)', '199g', 12, 'Available', 1, 1, 90, NOW(6)),
(15, 'iPhone 16 Pro Max 256GB Titan Sa Mạc', 'AP-IP16PM-256-DESERT', 34990000.00, 33490000.00, 50, 'Màu Titan Sa Mạc sang trọng quý phái, màn hình 6.9 inch lớn nhất từ trước đến nay cùng chip A18 Pro dẫn đầu công nghệ.', '/images/products/iphone-16-pro-max-titan-sa-mac.jpg.webp', '6.9 inch Super Retina XDR OLED 120Hz viền mỏng nhất', 'iOS 18, Apple Intelligence', '12MP TrueDepth', '48MP Fusion + 48MP Ultra Wide + 12MP 5x Tele', 'Apple A18 Pro (3nm)', '8GB', '256GB', '4685 mAh, Sạc nhanh 30W', 'Titan Sa Mạc', '227g', 12, 'Available', 1, 1, 180, NOW(6)),
(16, 'iPhone 16 Pro 128GB Titan Tự Nhiên', 'AP-IP16P-128-NAT', 28990000.00, 27990000.00, 40, 'Camera 5x tiềm vọng tích hợp trong thân máy 6.3 inch nhỏ gọn, quay video 4K 120fps Dolby Vision điện ảnh.', '/images/products/iphone-16-pro-titan-tu-nhien.jpg.webp', '6.3 inch Super Retina XDR OLED 120Hz ProMotion', 'iOS 18', '12MP', '48MP Fusion + 48MP Ultra Wide + 12MP 5x Tele', 'Apple A18 Pro (3nm)', '8GB', '128GB', '3582 mAh, Nút Camera Control', 'Titan Tự Nhiên', '199g', 12, 'Available', 1, 1, 115, NOW(6)),
(17, 'iPhone 17 Pro Max 256GB Cam Hoàng Hôn', 'AP-IP17PM-256-ORANGE', 36990000.00, 35490000.00, 30, 'Màu Cam Sunset rực rỡ, chip 2nm đầu tiên và hệ thống tản nhiệt buồng hơi graphene làm mát siêu tốc.', '/images/products/iphone-17-pro-max-cam.jpg.webp', '6.9 inch LTPO Super Retina XDR OLED 3000 nits', 'iOS 19, Apple Intelligence Pro', '24MP TrueDepth', '48MP Fusion + 48MP Ultra Wide + 48MP Periscope 10x', 'Apple A19 Pro (2nm TSMC)', '12GB', '256GB', '4900 mAh, Tản nhiệt buồng hơi Graphene', 'Cam Hoàng Hôn', '225g', 12, 'Available', 1, 1, 65, NOW(6)),
(18, 'iPhone 17 Pro 256GB Xanh Đậm', 'AP-IP17P-256-DEEPBLUE', 31990000.00, 30490000.00, 35, 'Sắc xanh thẫm huyền bí, ống kính phủ lớp phủ chống lóa quang học cao cấp và RAM 12GB đa nhiệm mượt mà.', '/images/products/iphone-17-pro-xanh-dam.jpg.webp', '6.3 inch Super Retina XDR OLED 120Hz chống chói', 'iOS 19', '24MP', '48MP + 48MP + 48MP Triple Pro Lens', 'Apple A19 Pro (2nm)', '12GB', '256GB', '3850 mAh, Nút Camera Cảm ứng lực', 'Deep Navy Blue', '198g', 12, 'Available', 1, 1, 50, NOW(6)),
(19, 'iPhone 18 Pro 256GB Bạc Titanium Future', 'AP-IP18P-256', 35990000.00, 33990000.00, 20, 'FaceID và camera trước ẩn hoàn toàn dưới màn hình, pin thể rắn an toàn tuyệt đối với tuổi thọ gấp 3 lần.', '/images/products/iphone-18-pro-000-6.jpg', '6.3 inch Tràn viền vô cực FaceID ẩn dưới màn hình', 'iOS 20 Quantum AI', '32MP Under Display Camera', '108MP Quantum Sensor + 48MP + 48MP LiDAR Gen 3', 'Apple A20 Bionic (2nm GAA)', '16GB', '256GB', '4200 mAh Thể rắn (Solid-State)', 'Bạc Không Gian', '195g', 12, 'Available', 1, 1, 42, NOW(6)),
(20, 'iPhone 18 Pro Max 512GB Titan Đen Sao Hỏa', 'AP-IP18PM-512', 41990000.00, 39990000.00, 20, 'Siêu phẩm tương lai với màn hình MicroLED không điểm khuyết, công nghệ chụp đêm lượng tử và RAM 16GB.', '/images/products/iphone-18-pro-max-000-7.jpg', '6.9 inch MicroLED 144Hz Không khiếm khuyết', 'iOS 20 Apple Neural Engine 64-Core', '32MP Ẩn màn hình', '108MP Fusion + 64MP Ultra + 64MP 15x Zoom', 'Apple A20 Pro Extreme', '16GB', '512GB', '5200 mAh Solid-State, Sạc MagSafe 50W', 'Titan Đen Sao Hỏa', '224g', 12, 'Available', 1, 1, 38, NOW(6)),
(21, 'iPhone Air Siêu Mỏng 128GB Vàng Nhạt', 'AP-IPAIR-128-GOLD', 26990000.00, 25490000.00, 30, 'Độ mỏng kỷ lục chỉ 5.1mm, trọng lượng siêu nhẹ đem lại cảm giác cầm nắm bay bổng như không khí.', '/images/products/iphone-air-vang-nhat.jpg.webp', '6.6 inch Super Retina XDR OLED mỏng 5.1mm', 'iOS 19', '24MP Center Stage', '48MP Fusion Camera', 'Apple A19 (2nm)', '8GB', '128GB', '3400 mAh Si/C High Density', 'Vàng Nhạt (Champagne)', '165g', 12, 'Available', 1, 1, 60, NOW(6)),
(22, 'iPhone SE 2022 64GB Đỏ Product RED', 'AP-IPSE3-64-RED', 7490000.00, 6990000.00, 30, 'Nút Home cảm biến vân tay Touch ID tiện lợi, chip A15 Bionic 5G mạnh mẽ trong thiết kế cổ điển.', '/images/products/iphone-se-2022-red.jpg.webp', '4.7 inch Retina HD Touch ID', 'iOS 17', '7MP FaceTime HD', '12MP Wide Camera Smart HDR 4', 'Apple A15 Bionic 5G (5nm)', '4GB', '64GB', '2018 mAh, Sạc nhanh 20W', 'Product RED', '144g', 12, 'Available', 1, 1, 88, NOW(6)),
(23, 'Vivo iQOO 13 5G 256GB Xám Titan', 'VV-IQOO13-256-GREY', 15490000.00, 14290000.00, 25, 'Vòng đèn LED Monster Halo phát sáng quanh camera, chip Q2 siêu phân giải game và sạc nhanh 120W.', '/images/products/iqoo-13-mau-xam.jpg.webp', '6.82 inch 2K BOE Q10 AMOLED 144Hz Monster Halo LED', 'OriginOS 5, Android 15', '32MP', '50MP Sony IMX921 VCS OIS + 50MP Tele 2x + 50MP Ultra Wide', 'Snapdragon 8 Elite + Chip Q2 Gaming', '16GB', '256GB', '6150 mAh Blue Ocean, Sạc 120W', 'Xám Titan', '213g', 12, 'Available', 6, 3, 48, NOW(6)),
(24, 'Nubia Red Magic 7 Pro Transformers Edition Xanh', 'NB-RM7P-TRANS', 10990000.00, 9850000.00, 15, 'Phiên bản giới hạn Transformers Decepticon cực ngầu, quạt tản nhiệt cơ học 20.000 vòng/phút và sạc 135W.', '/images/products/nubia-red-magic-7-pro-transformer-xanh.png.webp', '6.8 inch AMOLED 120Hz Không khuyết điểm UDC', 'Redmagic OS 5.0', '16MP Ẩn dưới màn hình', '64MP + 8MP + 2MP', 'Snapdragon 8 Gen 1 + Quạt tản nhiệt ICE 9.0 20000 RPM', '16GB', '512GB', '5000 mAh, Sạc nhanh 135W GaN', 'Xanh Transformers', '235g', 12, 'Available', 8, 3, 36, NOW(6)),
(25, 'Oppo Find N6 Màn Hình Gập 512GB Cam Da Bò', 'OP-FINDN6-512-ORANGE', 32990000.00, 29990000.00, 20, 'Mặt lưng da bò sang trọng, bản lề uốn tàng hình không nếp gấp và hệ thống camera hợp tác cùng Hasselblad.', '/images/products/oppo-find-n6-chinh-hang-cam.jpg', 'Gập trong 7.82 inch 2K LTPO3 120Hz + Ngoài 6.31 inch 120Hz', 'ColorOS 15, Android 15', '32MP + 20MP Kép', '50MP Sony LYT-T808 Hasselblad + 64MP Periscope 3x + 48MP', 'Snapdragon 8 Elite (3nm)', '16GB', '512GB', '5200 mAh, SuperVOOC 80W + Không dây 50W', 'Cam Da Bò', '239g', 12, 'Available', 5, 5, 30, NOW(6)),
(26, 'Oppo Find X9 Nhung Titan 512GB', 'OP-FINDX9-512-TITAN', 24490000.00, 22990000.00, 25, 'Chất liệu kính nhung Titan sờ cực êm tay, hiệu năng Dimensity 9400 siêu mát và pin Glacier 5910mAh.', '/images/products/oppo-find-x9-nhung-titan.jpg', '6.78 inch LTPO AMOLED 1.5K 120Hz 4500 nits', 'ColorOS 15', '32MP Sony IMX615', '50MP Sony LYT-808 Hasselblad + 50MP Tele 3x + 50MP Ultra Wide', 'Dimensity 9400 (3nm TSMC)', '16GB', '512GB', '5910 mAh Glacier, Sạc 80W', 'Nhung Titan', '213g', 12, 'Available', 5, 2, 40, NOW(6)),
(27, 'Oppo Find X9 Pro 512GB Đỏ Rượu Vang Hasselblad', 'OP-FINDX9P-512-RED', 27990000.00, 25990000.00, 25, 'Ống kính tiềm vọng 200MP chụp zoom xa siêu sắc nét và màu đỏ rượu vang đẳng cấp quý phái.', '/images/products/oppo-find-x9-pro-do.jpg', '6.78 inch Micro-Quad Curved AMOLED 1.5K 120Hz', 'ColorOS 15 AI', '32MP AF', '50MP 1-inch LYT-900 Hasselblad + 200MP Periscope Telephoto 6x + 50MP', 'Dimensity 9400 Pro (3nm)', '16GB', '512GB', '5910 mAh, SuperVOOC 100W + AirVOOC 50W', 'Đỏ Rượu Vang', '215g', 12, 'Available', 5, 2, 35, NOW(6)),
(28, 'Oppo Reno 14 5G 256GB Xanh Lá Ngọc Bích', 'OP-RENO14-256-GREEN', 14990000.00, 13990000.00, 35, 'Chuyên gia chân dung thế hệ mới với bộ camera kép 50MP và thiết kế vân ngọc bích lấp lánh.', '/images/products/oppo-reno14-xanh-la.jpg.webp', '6.7 inch AMOLED 120Hz 1.5K Viền siêu mỏng', 'ColorOS 15', '50MP AF Chân dung AI', '50MP Sony OIS + 50MP Tele Chân dung + 8MP Ultra Wide', 'Dimensity 8350 (4nm)', '12GB', '256GB', '5600 mAh, SuperVOOC 80W', 'Xanh Lá Ngọc Bích', '187g', 12, 'Available', 5, 4, 62, NOW(6)),
(29, 'Realme GT 7 Global 256GB Blue', 'RM-GT7-256-BLUE', 11990000.00, 10990000.00, 30, 'Màn hình sáng nhất thế giới 6000 nits, dung lượng pin 6500mAh trâu bò và sạc nhanh 120W.', '/images/products/realme-gt-7-global-blue.jpg.webp', '6.78 inch Eco2 OLED Plus 120Hz 6000 nits', 'Realme UI 6.0, Android 15', '32MP', '50MP Sony IMX906 OIS + 50MP Telephoto 3x + 8MP', 'Dimensity 9400e (3nm)', '12GB', '256GB', '6500 mAh Titan, Sạc siêu tốc 120W', 'Global Blue', '222g', 12, 'Available', 7, 2, 58, NOW(6)),
(30, 'Realme GT Neo 5 240W 256GB Tím Vũ Trụ RGB', 'RM-GTNEO5-240W-PURPLE', 7990000.00, 7050000.00, 30, 'Công nghệ sạc nhanh 240W đỉnh cao đầy pin chỉ 9 phút, dải đèn LED Halo RGB trong suốt độc đáo.', '/images/products/realme-gt-neo-5-240w-tim-0.jpg.webp', '6.74 inch 1.5K AMOLED 144Hz Đèn LED Halo RGB 25 màu', 'Realme UI 5.0', '16MP', '50MP Sony IMX890 OIS + 8MP + 2MP Microscope', 'Snapdragon 8+ Gen 1 5G', '16GB', '256GB', '4600 mAh, Sạc siêu tốc 240W (0-100% trong 9 phút)', 'Tím Vũ Trụ RGB', '199g', 12, 'Available', 7, 3, 120, NOW(6)),
(31, 'Realme P4 Power 5G 128GB Xanh Phoenix', 'RM-P4P-128', 5990000.00, 5490000.00, 35, 'Pin 6000mAh bền bỉ 2 ngày, màn hình AMOLED 120Hz mượt mà và camera Sony OIS chụp đêm sắc nét.', '/images/products/realme-p4-power-9.jpg', '6.67 inch AMOLED 120Hz FHD+', 'Realme UI 5.0, Android 14', '16MP', '50MP Sony LYT-600 OIS + 8MP Ultra Wide', 'MediaTek Dimensity 7050 (6nm)', '8GB', '128GB', '6000 mAh Siêu Pin, Sạc 45W', 'Xanh Phoenix', '190g', 12, 'Available', 7, 4, 95, NOW(6)),
(32, 'Nubia Red Magic 9 Pro 512GB Đen Huyền Bí', 'NB-RM9P-512-BLACK', 15490000.00, 14500000.00, 25, 'Mặt lưng phẳng hoàn toàn không lồi camera, quạt tản nhiệt LED RGB 22.000 RPM và pin 6500mAh chơi game thả ga.', '/images/products/red-magic-black.webp', '6.8 inch BOE Q9+ AMOLED 120Hz Không nốt ruồi phẳng 100%', 'Redmagic OS 9.0', '16MP Ẩn màn hình Gen 5', '50MP Samsung GN5 OIS + 50MP Ultra Wide + 2MP', 'Snapdragon 8 Gen 3 + Quạt tản nhiệt ICE 13.0 22000 RPM RGB', '16GB', '512GB', '6500 mAh Khủng, Sạc nhanh 80W', 'Đen Huyền Bí', '229g', 12, 'Available', 8, 3, 85, NOW(6)),
(33, 'Nubia Red Magic 10 Pro 512GB Bạc Tuyết', 'NB-RM10P-512-WHITE', 16990000.00, 15990000.00, 30, 'Pin 7050mAh kim loại lỏng siêu khủng, chip Snapdragon 8 Elite hiệu năng mạnh nhất hành tinh và quạt tản nhiệt ICE X.', '/images/products/red-magic-white.webp', '6.85 inch 1.5K OLED 144Hz Không khuyết điểm 2000 nits', 'Redmagic OS 10.0, Android 15', '16MP Ẩn dưới màn hình Gen 6', '50MP OmniVision OV50E OIS + 50MP Ultra Wide', 'Snapdragon 8 Elite + Chip Gaming Red Core R3', '16GB', '512GB', '7050 mAh Kim Loại Lỏng, Sạc nhanh 120W', 'Bạc Tuyết (Moonlight White)', '229g', 12, 'Available', 8, 3, 90, NOW(6)),
(34, 'Samsung Galaxy S26 Ultra 5G AI 512GB', 'SS-S26U-512', 37990000.00, 34990000.00, 35, 'Quyền năng Galaxy AI thế hệ mới, kính chống phản chiếu Gorilla Armor 2 và bút S-Pen đa nhiệm đỉnh cao.', '/images/products/samsung-galaxy-s26-ultra-5g-0-4.jpg', '6.9 inch Dynamic AMOLED 2X 144Hz Kính Gorilla Armor 2', 'One UI 8, Android 16 Galaxy AI Pro', '16MP Dual Pixel AF', '200MP ISOCELL HP2 Pro + 50MP 5x Tele + 50MP 10x Space Zoom + 50MP', 'Snapdragon 8 Elite for Galaxy (3nm)', '16GB', '512GB', '5500 mAh, Bút S-Pen Bluetooth, Sạc 65W', 'Titanium Silver Shadow', '232g', 12, 'Available', 2, 2, 110, NOW(6)),
(35, 'Samsung Galaxy Z Fold 8 5G 512GB Tím Huyền Ảo', 'SS-ZFOLD8-512-PURPLE', 51990000.00, 48990000.00, 15, 'Màn hình gập lớn 8 inch phẳng không nếp gấp, camera 200MP chuẩn nhiếp ảnh điện ảnh và khung titan siêu bền.', '/images/products/samsung-galaxy-z-fold-8-tim.jpg', 'Gập trong 8.0 inch Dynamic AMOLED 2X 120Hz + Ngoài 6.5 inch', 'One UI 8 gập chuyên dụng', '12MP + 10MP UDC', '200MP OIS + 50MP Tele 5x + 12MP Ultra Wide', 'Snapdragon 8 Elite for Galaxy', '16GB', '512GB', '4800 mAh, Kháng nước IP48, Mỏng 8.9mm', 'Tím Huyền Ảo', '226g', 12, 'Available', 2, 5, 28, NOW(6)),
(36, 'Samsung Galaxy Z Fold 8 Ultra 1TB Đen Titan', 'SS-ZFOLD8U-1TB-BLACK', 59990000.00, 56990000.00, 10, 'Phiên bản Ultra giới hạn với dung lượng lưu trữ 1TB, RAM 24GB và khả năng zoom quang học 10x chân thực.', '/images/products/samsung-galaxy-z-fold-8-ultra-den.jpg', 'Màn hình kép gập 8.2 inch 3K 120Hz + Phụ 6.5 inch 144Hz', 'One UI 8 Galaxy AI Ultra', '16MP UDC Ẩn dưới màn hình', '200MP + 50MP Zoom 10x Quang học + 50MP Macro', 'Snapdragon 8 Elite Overclocked', '24GB', '1TB', '5100 mAh, Khung Titan Cấp 5 Hàng Không', 'Đen Titan Obsidian', '230g', 12, 'Available', 2, 5, 18, NOW(6)),
(37, 'Samsung Galaxy Z Fold 6 5G 256GB Xám Metal', 'SS-ZFOLD6-256-GREY', 43990000.00, 39990000.00, 25, 'Khung nhôm Armor Aluminum gia cường, thiết kế vuông vức nam tính và bộ công cụ Galaxy AI thông minh.', '/images/products/samsung-galaxy-z-fold6-xam-metal.jpg.webp', 'Màn trong 7.6 inch Dynamic AMOLED 2X 120Hz 2600 nits', 'One UI 6.1.1, Galaxy AI', '10MP + 4MP UDC', '50MP Dual Pixel OIS + 10MP Tele 3x + 12MP', 'Snapdragon 8 Gen 3 for Galaxy (4nm)', '12GB', '256GB', '4400 mAh, Bản lề rãnh kép chống va đập', 'Xám Metal', '239g', 12, 'Available', 2, 5, 65, NOW(6)),
(38, 'Samsung Galaxy Z Fold 7 5G 512GB Xanh Navy', 'SS-ZFOLD7-512-NAVY', 45990000.00, 42990000.00, 25, 'Bản lề cải tiến xóa mờ nếp gấp đến 95%, camera 108MP Pro Visual Engine siêu chi tiết.', '/images/products/samsung-galaxy-z-fold7-xanh-navy.jpg.webp', 'Màn trong 7.8 inch Dynamic AMOLED 2X 120Hz chống nếp gấp 95%', 'One UI 7.0 Galaxy AI', '12MP + 10MP', '108MP Pro Visual Engine + 50MP Tele 5x + 12MP', 'Snapdragon 8 Elite (3nm)', '16GB', '512GB', '4600 mAh, Sạc nhanh 45W', 'Xanh Navy', '230g', 12, 'Available', 2, 5, 50, NOW(6)),
(39, 'Vivo iQOO Z11 Turbo 5G 256GB Bạc Ánh Kim', 'VV-IQOOZ11T-256', 8990000.00, 8190000.00, 30, 'Chip đồ họa độc lập nội suy khung hình game 144 FPS mượt mà, pin 6400mAh sạc nhanh 90W.', '/images/products/vivo-iqoo-z11-turbo-0-7.jpg', '6.78 inch 1.5K LTPS AMOLED 144Hz', 'OriginOS 5', '16MP', '50MP Sony LYT-600 OIS + 8MP Ultra Wide', 'Snapdragon 8s Gen 4 + Chip đồ họa độc lập', '12GB', '256GB', '6400 mAh Blue Ocean Si/C, Sạc 90W', 'Bạc Ánh Kim', '196g', 12, 'Available', 6, 3, 62, NOW(6)),
(40, 'Vivo iQOO Z9 Turbo Plus 256GB Titan', 'VV-IQOOZ9TP-256-TITAN', 8290000.00, 7650000.00, 30, 'Điểm hiệu năng AnTuTu vượt 2.3 triệu điểm với Dimensity 9300+, pin 6400mAh chiến game liên tục 10 giờ.', '/images/products/vivo-iqoo-z9-turbo-plus-titan.jpg.webp', '6.78 inch 1.5K AMOLED 144Hz HDR10+ 4500 nits', 'OriginOS 4, Android 14', '16MP', '50MP Sony LYT-600 OIS + 8MP', 'MediaTek Dimensity 9300+ (4nm TSMC)', '12GB', '256GB', '6400 mAh Cực Khủng, Sạc 80W', 'Titan Moonlight', '196g', 12, 'Available', 6, 3, 95, NOW(6)),
(41, 'Vivo iQOO Z9 Turbo 256GB Xanh Mint', 'VV-IQOOZ9T-256-MINT', 6990000.00, 6150000.00, 35, 'Smartphone tầm trung hiệu năng vô địch tầm giá với chip Snapdragon 8s Gen 3 và màn hình bảo vệ mắt 3840Hz PWM.', '/images/products/vivo-iqoo-z9-turbo-xanh.jpg.webp', '6.78 inch 1.5K AMOLED 144Hz 3840Hz PWM', 'OriginOS 4', '16MP', '50MP Sony LYT-600 OIS + 8MP', 'Snapdragon 8s Gen 3 (4nm)', '12GB', '256GB', '6000 mAh Siêu Mỏng, Sạc 80W', 'Xanh Mint', '194g', 12, 'Available', 6, 4, 130, NOW(6)),
(42, 'Vivo X200 5G 256GB Titan ZEISS', 'VV-X200-256-TITAN', 13990000.00, 12850000.00, 35, 'Ống kính ZEISS T* chống lóa tái tạo màu sắc chân thực, vi xử lý Dimensity 9400 tiến trình 3nm tiết kiệm điện năng.', '/images/products/vivo-x200-titan.jpg.webp', '6.67 inch Micro-Quad Curved AMOLED 1.5K 120Hz ZEISS', 'OriginOS 5, Android 15', '32MP', '50MP Sony IMX921 VCS ZEISS T* + 50MP Tele + 50MP', 'MediaTek Dimensity 9400 (3nm)', '12GB', '256GB', '5800 mAh Blue Ocean, Sạc 90W', 'Titan Tự Nhiên', '197g', 12, 'Available', 6, 2, 80, NOW(6)),
(43, 'Vivo X200 Ultra 512GB Trắng Sứ ZEISS 200MP', 'VV-X200U-512-WHITE', 25990000.00, 23990000.00, 25, 'Vua nhiếp ảnh di động với cảm biến 1 inch kết hợp ống kính tiềm vọng 200MP chuẩn quang học ZEISS APO.', '/images/products/vivo-x200-ultra-trang.jpg.webp', '6.78 inch Samsung 2K E7 LTPO AMOLED 120Hz', 'OriginOS 5 AI', '50MP AF', '50MP 1-inch LYT-900 + 200MP Periscope ISOCELL HP9 ZEISS APO + 50MP', 'Snapdragon 8 Elite + Chip V3+', '16GB', '512GB', '6000 mAh, Sạc nhanh 100W + Không dây 50W', 'Trắng Sứ Hoàng Gia', '229g', 12, 'Available', 6, 2, 45, NOW(6)),
(44, 'Vivo X300 Pro 5G 512GB Tím Tinh Vân ZEISS', 'VV-X300P-512-PURPLE', 27990000.00, 25490000.00, 20, 'Sắc tím vũ trụ chuyển màu kỳ ảo, vi xử lý 2nm thế hệ tương lai và khả năng quay video đêm 8K ZEISS Cinematic.', '/images/products/vivo-x300-tim.jpg', '6.82 inch 2K Micro-Curved AMOLED 120Hz 4500 nits', 'OriginOS 6, Android 16', '50MP ZEISS Portrait', '50MP 1-inch Sony LYT-950 + 200MP ZEISS APO Periscope + 50MP', 'Dimensity 9500 (2nm TSMC)', '16GB', '512GB', '6200 mAh Blue Ocean, Sạc 120W', 'Tím Tinh Vân', '225g', 12, 'Available', 6, 2, 30, NOW(6)),
(45, 'Xiaomi 14 Pro Plus 512GB Titan HyperOS', 'MI-14PP-512', 16490000.00, 14990000.00, 30, 'Khẩu độ cơ học biến thiên 1024 bước từ f/1.42 đến f/4.0, mặt kính cường lực Xiaomi Dragon Crystal chống vỡ gấp 10 lần.', '/images/products/xiaomi-14-pro-plus-minh-hoa-0.jpg.webp', '6.73 inch 2K LTPO AMOLED 120Hz Kính Dragon Crystal', 'Xiaomi HyperOS', '32MP', '50MP Light Hunter 900 Khẩu độ biến thiên f/1.42-f/4.0 Leica + 50MP + 50MP', 'Snapdragon 8 Gen 3 (4nm)', '16GB', '512GB', '4880 mAh, Sạc siêu tốc 120W', 'Titan Xám', '223g', 12, 'Available', 3, 2, 72, NOW(6)),
(46, 'Xiaomi 17 Pro Max 512GB Xanh Rừng Nhiệt Đới', 'MI-17PM-512-GREEN', 23990000.00, 21990000.00, 30, 'Màu xanh Forest Green thời thượng, bộ 4 camera Leica cao cấp và tản nhiệt buồng hơi hình khuyên thế hệ mới.', '/images/products/xiaomi-17-pro-max-xanh-la.jpg.webp', '6.73 inch 2K+ AMOLED 120Hz C2+ TCL 4000 nits', 'Xiaomi HyperOS 2.0', '32MP AF', '50MP Leica Quad Camera Light Hunter 950 + 50MP Tele 5x + 50MP', 'Snapdragon 8 Elite (3nm)', '16GB', '512GB', '6100 mAh Si/C, Sạc 120W', 'Xanh Rừng Nhiệt Đới', '219g', 12, 'Available', 3, 2, 50, NOW(6)),
(47, 'Xiaomi 17 Ultra 5G 512GB Leica Master', 'MI-17U-512', 28990000.00, 26990000.00, 25, 'Khẳng định đẳng cấp máy ảnh chuyên nghiệp trong thân máy smartphone với 4 camera Leica Summilux và zoom 10x quang học.', '/images/products/xiaomi-17-ultra-5g-mau-2.jpg', '6.73 inch 2K OLED 120Hz Kính Ceramic Shield Gen 2', 'Xiaomi HyperOS 2.0 AI', '50MP Leica Quad Lens', '50MP 1-inch LYT-900 Leica Summilux + 200MP Periscope Telephoto 10x + 50MP + 50MP', 'Snapdragon 8 Elite Extreme Edition', '16GB', '512GB', '6000 mAh, Sạc 90W Dây + 80W Không dây', 'Đen Da Bò Leica Master', '225g', 12, 'Available', 3, 2, 40, NOW(6)),
(48, 'Xiaomi Mi 10 Ultra 256GB Trắng Gốm Ceramic', 'MI-10U-256-CERAMIC', 6990000.00, 6490000.00, 20, 'Phiên bản kỷ niệm 10 năm của Xiaomi với mặt lưng gốm Ceramic trắng tinh khôi và khả năng zoom 120x kỹ thuật số.', '/images/products/xiaomi-mi-10-ultra-trang.jpg.webp', '6.67 inch OLED 120Hz 10-bit màu HDR10+', 'MIUI 14', '20MP', '48MP OIS 8K + 48MP Zoom 120x + 20MP + 12MP', 'Snapdragon 865 5G', '12GB', '256GB', '4500 mAh Graphene, Sạc siêu nhanh 120W + 50W Không dây', 'Trắng Gốm Ceramic', '221g', 12, 'Available', 3, 2, 98, NOW(6)),
(49, 'Xiaomi MIX Flip 2 512GB Vàng Champagne', 'MI-MIXFLIP2-512-GOLD', 20990000.00, 18990000.00, 25, 'Màn hình phụ ngoài lớn 4.01 inch tràn viền sử dụng độc lập mọi ứng dụng, camera kép Leica và bản lề gập giọt nước siêu bền.', '/images/products/xiaomi-mix-flip-2-vang-1.jpg.webp', 'Màn chính gập 6.86 inch 1.5K 120Hz + Màn phụ ngoài 4.01 inch tràn viền Leica', 'Xiaomi HyperOS 2.0', '32MP OmniVision', '50MP Light Hunter 800 Leica OIS + 50MP Telephoto 2x Leica', 'Snapdragon 8 Elite (3nm)', '16GB', '512GB', '4780 mAh Surge G1, Sạc 67W', 'Vàng Champagne', '192g', 12, 'Available', 3, 5, 45, NOW(6));

-- 5. Thêm giỏ hàng mẫu
INSERT INTO `Carts` (`CartId`, `UserId`) VALUES (1, 2);
INSERT INTO `CartItems` (`CartItemId`, `CartId`, `ProductId`, `Quantity`) VALUES
(1, 1, 15, 1),
(2, 1, 34, 1);

-- 6. Thêm đơn hàng mẫu
INSERT INTO `Orders` (`OrderId`, `UserId`, `ReceiverName`, `ReceiverPhone`, `ShippingAddress`, `PaymentMethod`, `Notes`, `TotalAmount`, `Status`, `CreatedAt`) VALUES
(1001, 2, 'Khách Hàng Mẫu', '0977777777', '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', 'COD', 'Giao hàng trong giờ hành chính', 33490000.00, 'Completed', '2026-08-14 10:30:00.000000'),
(1002, 2, 'Khách Hàng Mẫu', '0977777777', '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', 'VNPAY', 'Gọi trước khi giao 15 phút', 34990000.00, 'Shipping', '2026-08-15 14:15:00.000000'),
(1003, 1, 'Quản Trị Viên', '0988888888', 'Trụ sở PhoneStore, Hoàn Kiếm, Hà Nội', 'MOMO', 'Đơn thử nghiệm hệ thống', 18990000.00, 'Confirmed', '2026-08-15 18:00:00.000000');

INSERT INTO `OrderDetails` (`OrderDetailId`, `OrderId`, `ProductId`, `Quantity`, `UnitPrice`, `TotalPrice`) VALUES
(1, 1001, 15, 1, 33490000.00, 33490000.00),
(2, 1002, 34, 1, 34990000.00, 34990000.00),
(3, 1003, 5, 1, 18990000.00, 18990000.00);

SET FOREIGN_KEY_CHECKS = 1;
