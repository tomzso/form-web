namespace api.Dtos.FormField
{
    public class UpdateFormFieldDto
    {
        public string Label { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public bool Required { get; set; } = false;
        public string ImageUrl { get; set; } = string.Empty;
    }
}
