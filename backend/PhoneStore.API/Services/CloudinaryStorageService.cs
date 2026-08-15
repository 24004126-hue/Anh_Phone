using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using PhoneStore.API.Interfaces;

namespace PhoneStore.API.Services
{
    public class CloudinaryStorageService : IStorageService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<CloudinaryStorageService> _logger;
        private readonly Cloudinary? _cloudinary;

        public CloudinaryStorageService(IConfiguration configuration, ILogger<CloudinaryStorageService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var cloudName = _configuration["CloudinarySettings:CloudName"];
            var apiKey = _configuration["CloudinarySettings:ApiKey"];
            var apiSecret = _configuration["CloudinarySettings:ApiSecret"];

            if (!string.IsNullOrWhiteSpace(cloudName) && !string.IsNullOrWhiteSpace(apiKey) && !string.IsNullOrWhiteSpace(apiSecret))
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(account);
                _cloudinary.Api.Secure = true;
                _logger.LogInformation("CloudinaryStorageService initialized with CloudName '{CloudName}'", cloudName);
            }
            else
            {
                _logger.LogInformation("Cloudinary credentials not provided. Operating in Local Storage fallback mode.");
            }
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "products")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is null or empty", nameof(file));

            // 1. CLOUD STORAGE VIA CLOUDINARY
            if (_cloudinary != null)
            {
                try
                {
                    await using var stream = file.OpenReadStream();
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = $"phonestore/{folder}",
                        Transformation = new Transformation().Quality("auto").FetchFormat("auto")
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        _logger.LogError("Cloudinary upload failed: {Message}", uploadResult.Error.Message);
                        throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
                    }

                    _logger.LogInformation("Successfully uploaded image to Cloudinary: {Url}", uploadResult.SecureUrl.AbsoluteUri);
                    return uploadResult.SecureUrl.AbsoluteUri;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Cloudinary upload failed. Falling back to local storage: {Message}", ex.Message);
                }
            }

            // 2. LOCAL STORAGE FALLBACK
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                extension = ".jpg";
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", folder);
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            await using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            _logger.LogInformation("Uploaded image to Local Storage: /uploads/{Folder}/{FileName}", folder, uniqueFileName);
            return $"/uploads/{folder}/{uniqueFileName}";
        }

        public async Task<bool> DeleteImageAsync(string imageUrlOrPublicId)
        {
            if (string.IsNullOrWhiteSpace(imageUrlOrPublicId))
                return false;

            if (_cloudinary != null && imageUrlOrPublicId.Contains("cloudinary.com"))
            {
                try
                {
                    // Extract public_id from Cloudinary URL
                    var uri = new Uri(imageUrlOrPublicId);
                    var segments = uri.AbsolutePath.Split('/');
                    var filenameWithExt = segments[^1];
                    var folder = segments[^2];
                    var publicId = $"phonestore/{folder}/{Path.GetFileNameWithoutExtension(filenameWithExt)}";

                    var deleteParams = new DeletionParams(publicId);
                    var result = await _cloudinary.DestroyAsync(deleteParams);
                    return result.Result == "ok";
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to delete image from Cloudinary: {Message}", ex.Message);
                    return false;
                }
            }

            // Local storage delete
            try
            {
                var relativePath = imageUrlOrPublicId.TrimStart('/');
                var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
                if (File.Exists(localFilePath))
                {
                    File.Delete(localFilePath);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete local image: {Message}", ex.Message);
            }

            return false;
        }
    }
}
