using api.Dtos.FieldResponse;
using api.Dtos.FormFieldOption;
using api.Models;

namespace api.Dtos.FormField
{
    public class FormFieldDto
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string Label { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public bool Required { get; set; } = false;
        public string ImageUrl { get; set; } = string.Empty;

        //public string Options { get; set; } // This can be deprecated
        public int Order { get; set; } = 0;

        public List<FormFieldOptionDto>? Options { get; set; }

        public List<FieldResponseWithResponseCountDto>? Responses { get; set; }


    }
}
