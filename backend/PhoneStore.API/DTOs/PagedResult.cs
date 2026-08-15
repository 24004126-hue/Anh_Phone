namespace PhoneStore.API.DTOs
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();

        public int Page { get; set; }

        public int PageSize { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }
    }
}