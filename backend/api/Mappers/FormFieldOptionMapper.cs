using api.Dtos.FormFieldOption;
using api.Models;

namespace api.Mappers
{
    public static class FormFieldOptionMapper
    {
        public static FormFieldOptionDto ToFormFieldOptionDto(this FormFieldOption formFieldOption )
        {
            return new FormFieldOptionDto
            {
                Id = formFieldOption.Id,
                FieldId = formFieldOption.FieldId,
                OptionValue = formFieldOption.OptionValue,
                Order = formFieldOption.Order,
                ResponseCount = formFieldOption.ResponseCount,
                IsCorrect = formFieldOption.IsCorrect
            };
        }
        public static FormFieldOption ToFormFieldOptionFromCreate (this CreateFormFieldOptionDto createFormFieldOptionDto, int formFieldId)
        {
            return new FormFieldOption
            {
                FieldId = formFieldId,
                OptionValue = createFormFieldOptionDto.OptionValue.Trim(),
                Order = createFormFieldOptionDto.Order,
                IsCorrect = createFormFieldOptionDto.IsCorrect
            };
        }
        public static FormFieldOption ToFormFieldOptionFromUpdate (this UpdateFormFieldOptionDto updateFormFieldOptionDto)
        {
            return new FormFieldOption
            {
                OptionValue = updateFormFieldOptionDto.OptionValue,
                Order = updateFormFieldOptionDto.Order,
                IsCorrect = updateFormFieldOptionDto.IsCorrect
            };
        }
    }
}
