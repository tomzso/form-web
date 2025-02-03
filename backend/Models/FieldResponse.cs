namespace api.Models
{
    public class FieldResponse
    {
        public int Id { get; set; }
        public int ResponseId { get; set; }
        public int FieldId { get; set; }
        public string Value { get; set; } = string.Empty;

        // Navigation Properties
        public FormResponse? FormResponse { get; set; }
        public FormField? FormField { get; set; }
    }
}
