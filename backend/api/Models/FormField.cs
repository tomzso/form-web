namespace api.Models
{
    public class FormField
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string Label { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool Required { get; set; } = false;
        //public string Options { get; set; } // This can be deprecated
        public int Order { get; set; } = 0;

        // Navigation Properties
        public Form? Form { get; set; }
        public List<FieldResponse>? FieldResponses { get; set; }
        public List<FormFieldOption>? FormFieldOptions { get; set; } // New relationship
    }
}
