using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ECommerce.API.Services.Interfaces;
using Microsoft.Extensions.Options;
using ECommerce.API.Models;

namespace ECommerce.API.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using var stream = file.OpenReadStream();
            
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                // ✅ Quality yerine Transformation kullan
                Transformation = new Transformation()
                    .Quality("auto:best")
                    .FetchFormat("auto")
                    .Flags("progressive")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            
            if (result.Error != null)
                throw new Exception($"Upload failed: {result.Error.Message}");

            return result.SecureUrl.ToString();
        }
    }
}