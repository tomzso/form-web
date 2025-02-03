namespace api.Dtos.FieldResponse
{
    public class FieldResponseDto
    {
        public int Id { get; set; }
        public int ResponseId { get; set; }
        public int FieldId { get; set; }
        public string Value { get; set; } = string.Empty;
        

    }
}
