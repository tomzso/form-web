using api.Dtos.FieldResponse;

namespace api.Dtos.FormResponse
{
    public class FormResponseDto
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string UserId { get; set; } = string.Empty; 
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public List<FieldResponseDto>? FieldResponses { get; set; }
    }
}
