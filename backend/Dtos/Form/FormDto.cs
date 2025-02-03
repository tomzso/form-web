using api.Dtos.FormField;

namespace api.Dtos.Form
{
    public class FormDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Url { get; set; }

        // Foreign Key to User (IdentityUser)
        public string? UserId { get; set; }
        public List<FormFieldDto>? FormFields { get; set; }

    }
}
