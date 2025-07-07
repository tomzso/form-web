namespace api.Dtos.FieldResponse
{
    public class FieldResponseWithResponseCountDto
    {
        public int FieldId { get; set; }
        public string Value { get; set; } = string.Empty;
        public int ResponseCount { get; set; }
    }
}
