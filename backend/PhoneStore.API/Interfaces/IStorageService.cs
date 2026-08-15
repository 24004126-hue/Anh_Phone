namespace PhoneStore.API.Interfaces
{
    public interface IStorageService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder = "products");
        Task<bool> DeleteImageAsync(string imageUrlOrPublicId);
    }
}
