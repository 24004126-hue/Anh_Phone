namespace PhoneStore.API.DTOs
{
    public class ProductQueryDto
    {
        public string? Keyword { get; set; }

        public int? BrandId { get; set; }

        public int? CategoryId { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public string? SortBy { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 8;
    }
}