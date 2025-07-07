namespace api.Dtos.FormFieldOption
{
    public class CreateFormFieldOptionDto
    {
 
        public string OptionValue { get; set; } = string.Empty;
        public int Order { get; set; } = 0;
        public bool IsCorrect { get; set; } = false;
    }
}
