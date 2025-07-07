namespace api.Dtos.FieldResponse
{
    public class CreateFieldResponseDto
    {
        public int ResponseId { get; set; }
        public int FieldId { get; set; }
        public string Value { get; set; } = string.Empty;
    }
}
