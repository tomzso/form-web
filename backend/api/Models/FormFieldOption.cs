namespace api.Models
{
    public class FormFieldOption
    {
        public int Id { get; set; }
        public int FieldId { get; set; }
        public string OptionValue { get; set; } = string.Empty;
        public int Order { get; set; } = 0;
        public bool IsCorrect { get; set; } = false;
        public int ResponseCount { get; set; } = 0;

        // Navigation Property
        public FormField? FormField { get; set; }
    }
}
