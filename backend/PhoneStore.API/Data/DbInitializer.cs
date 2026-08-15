using PhoneStore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace PhoneStore.API.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            // 1. Tạo các bảng cốt lõi nếu chưa có
            await context.Database.EnsureCreatedAsync();

            // 2. Tạo bổ sung bảng RefreshTokens và ProductVariants
            try
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS `RefreshTokens` (
                        `RefreshTokenId` INT NOT NULL AUTO_INCREMENT,
                        `UserId` INT NOT NULL,
                        `Token` VARCHAR(255) NOT NULL,
                        `ExpiresAt` DATETIME(6) NOT NULL,
                        `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                        `IsRevoked` TINYINT(1) NOT NULL DEFAULT 0,
                        PRIMARY KEY (`RefreshTokenId`),
                        KEY `IX_RefreshTokens_UserId` (`UserId`),
                        KEY `idx_refreshtokens_token` (`Token`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
                        KEY `IX_ProductVariants_ProductId` (`ProductId`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");
            }
            catch
            {
                // Bỏ qua nếu đã tồn tại
            }

            // 3. Tự động Seed Brands nếu rỗng
            if (!await context.Brands.AnyAsync())
            {
                var brands = new List<Brand>
                {
                    new Brand { BrandName = "Apple" },
                    new Brand { BrandName = "Samsung" },
                    new Brand { BrandName = "Xiaomi" },
                    new Brand { BrandName = "Asus" },
                    new Brand { BrandName = "Oppo" },
                    new Brand { BrandName = "Vivo" }
                };
                await context.Brands.AddRangeAsync(brands);
                await context.SaveChangesAsync();
            }

            // 4. Tự động Seed Categories nếu rỗng
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new Category { CategoryName = "iPhone" },
                    new Category { CategoryName = "Flagship Android" },
                    new Category { CategoryName = "Gaming Phone" },
                    new Category { CategoryName = "Smartphone Tầm Trung" },
                    new Category { CategoryName = "Phụ Kiện Chính Hãng" }
                };
                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // 5. Tự động Seed Users mặc định nếu rỗng
            if (!await context.Users.AnyAsync())
            {
                var adminHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                var customerHash = BCrypt.Net.BCrypt.HashPassword("customer123");

                var users = new List<User>
                {
                    new User
                    {
                        FullName = "Quản Trị Viên",
                        Email = "admin@gmail.com",
                        PasswordHash = adminHash,
                        Phone = "0988888888",
                        Address = "Trụ sở PhoneStore, Hà Nội",
                        Role = "Admin",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        FullName = "Khách Hàng Mẫu",
                        Email = "customer@gmail.com",
                        PasswordHash = customerHash,
                        Phone = "0977777777",
                        Address = "123 Nguyễn Huệ, Q1, TP.HCM",
                        Role = "Customer",
                        CreatedAt = DateTime.Now
                    }
                };
                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }

            // 6. Tự động Seed Products nếu rỗng
            if (!await context.Products.AnyAsync())
            {
                var apple = await context.Brands.FirstOrDefaultAsync(b => b.BrandName == "Apple");
                var samsung = await context.Brands.FirstOrDefaultAsync(b => b.BrandName == "Samsung");
                var asus = await context.Brands.FirstOrDefaultAsync(b => b.BrandName == "Asus");
                var xiaomi = await context.Brands.FirstOrDefaultAsync(b => b.BrandName == "Xiaomi");

                var iphoneCat = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "iPhone");
                var androidCat = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Flagship Android");
                var gamingCat = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Gaming Phone");

                if (apple != null && iphoneCat != null)
                {
                    var products = new List<Product>
                    {
                        new Product
                        {
                            ProductName = "iPhone 16 Pro Max 256GB Titan Sa Mạc",
                            SKU = "IP16PM-256-DESERT",
                            Price = 34990000,
                            DiscountPrice = 33490000,
                            Quantity = 50,
                            SoldQuantity = 120,
                            BrandId = apple.BrandId,
                            CategoryId = iphoneCat.CategoryId,
                            Thumbnail = "/images/hero/iphone16-desert.png",
                            Screen = "6.9 inch Super Retina XDR OLED 120Hz",
                            OperatingSystem = "iOS 18",
                            FrontCamera = "12MP TrueDepth",
                            RearCamera = "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto",
                            Chip = "Apple A18 Pro (3nm)",
                            RAM = "8GB",
                            Storage = "256GB",
                            Battery = "4685 mAh, Sạc nhanh 30W",
                            Color = "Titan Sa Mạc",
                            Description = "Siêu phẩm đỉnh cao công nghệ 2026 với khung titan chuẩn hàng không vũ trụ và chip A18 Pro mạnh mẽ nhất.",
                            Warranty = 12,
                            Status = "Available"
                        },
                        new Product
                        {
                            ProductName = "iPhone 15 128GB",
                            SKU = "IP15-128",
                            Price = 19990000,
                            DiscountPrice = 18490000,
                            Quantity = 30,
                            SoldQuantity = 85,
                            BrandId = apple.BrandId,
                            CategoryId = iphoneCat.CategoryId,
                            Thumbnail = "/images/products/iphone-15.jpg",
                            Screen = "6.1 inch Super Retina XDR",
                            OperatingSystem = "iOS 18",
                            FrontCamera = "12MP",
                            RearCamera = "48MP + 12MP",
                            Chip = "Apple A16 Bionic",
                            RAM = "6GB",
                            Storage = "128GB",
                            Battery = "3349 mAh",
                            Color = "Xanh Pastel",
                            Description = "Dynamic Island tiện ích, camera 48MP siêu nét và cổng USB-C tiện dụng.",
                            Warranty = 12,
                            Status = "Available"
                        }
                    };

                    if (samsung != null && androidCat != null)
                    {
                        products.Add(new Product
                        {
                            ProductName = "Samsung Galaxy S24 Ultra 5G 256GB",
                            SKU = "SS-S24U-256",
                            Price = 31990000,
                            DiscountPrice = 28990000,
                            Quantity = 40,
                            SoldQuantity = 95,
                            BrandId = samsung.BrandId,
                            CategoryId = androidCat.CategoryId,
                            Thumbnail = "/images/products/samsung-galaxy-s24-ultra.jpg",
                            Screen = "6.8 inch Dynamic AMOLED 2X 120Hz",
                            OperatingSystem = "Android 14, One UI 6.1",
                            FrontCamera = "12MP",
                            RearCamera = "200MP + 50MP + 12MP + 10MP",
                            Chip = "Snapdragon 8 Gen 3 for Galaxy",
                            RAM = "12GB",
                            Storage = "256GB",
                            Battery = "5000 mAh, Sạc nhanh 45W",
                            Color = "Titan Xám",
                            Description = "Quyền năng Galaxy AI đỉnh cao với bút S-Pen tích hợp và camera 200MP zoom 100x.",
                            Warranty = 12,
                            Status = "Available"
                        });
                    }

                    if (asus != null && gamingCat != null)
                    {
                        products.Add(new Product
                        {
                            ProductName = "Asus ROG Phone 8 Pro 512GB",
                            SKU = "ROG8P-512",
                            Price = 29990000,
                            DiscountPrice = 27990000,
                            Quantity = 20,
                            SoldQuantity = 40,
                            BrandId = asus.BrandId,
                            CategoryId = gamingCat.CategoryId,
                            Thumbnail = "/images/products/asus-rog-phone-8-pro.jpg",
                            Screen = "6.78 inch AMOLED 165Hz LTPO",
                            OperatingSystem = "Android 14, ROG UI",
                            FrontCamera = "32MP",
                            RearCamera = "50MP Gimbal + 32MP Telephoto + 13MP",
                            Chip = "Snapdragon 8 Gen 3",
                            RAM = "16GB",
                            Storage = "512GB",
                            Battery = "5500 mAh, Sạc nhanh 65W",
                            Color = "Phantom Black",
                            Description = "Quái thú gaming di động với màn hình phụ AniMe Vision và tản nhiệt GameCool 8 tân tiến.",
                            Warranty = 12,
                            Status = "Available"
                        });
                    }

                    if (xiaomi != null && androidCat != null)
                    {
                        products.Add(new Product
                        {
                            ProductName = "Xiaomi 14 Ultra 512GB Leica",
                            SKU = "MI14U-512",
                            Price = 29990000,
                            DiscountPrice = 27490000,
                            Quantity = 25,
                            SoldQuantity = 50,
                            BrandId = xiaomi.BrandId,
                            CategoryId = androidCat.CategoryId,
                            Thumbnail = "/images/products/xiaomi-14-ultra.jpg",
                            Screen = "6.73 inch LTPO AMOLED 120Hz",
                            OperatingSystem = "Xiaomi HyperOS",
                            FrontCamera = "32MP",
                            RearCamera = "50MP 1-inch LYT-900 Leica Quad Camera",
                            Chip = "Snapdragon 8 Gen 3",
                            RAM = "16GB",
                            Storage = "512GB",
                            Battery = "5000 mAh, Sạc nhanh 90W",
                            Color = "Trắng Da",
                            Description = "Đỉnh cao nhiếp ảnh quang học cùng ống kính huyền thoại Leica Summilux.",
                            Warranty = 12,
                            Status = "Available"
                        });
                    }

                    await context.Products.AddRangeAsync(products);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
