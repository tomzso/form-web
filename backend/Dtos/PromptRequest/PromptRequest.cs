namespace api.Dtos.PromptRequest
{
    public class PromptRequest
    {
        public string ImageUrl { get; set; }
        public string Type { get; set; }
        public string Question { get; set; } = string.Empty;
    }
}
