using System;
using System.Collections.Generic;

namespace api.Models
{
    public class FormResponse
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string UserId { get; set; } = string.Empty;  
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Form? Form { get; set; }
        public AppUser? User { get; set; }
        public List<FieldResponse>? FieldResponses { get; set; }
    }
}
