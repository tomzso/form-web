using api.Dtos.FieldResponse;
using api.Dtos.FormField;
using api.Models;
using Azure;
using Microsoft.Extensions.Options;

namespace api.Mappers
{
    public static class FormFieldMapper
    {


        public static FormFieldDto ToFormFieldDto(this FormField formField)
        {
            var responses = formField.FieldResponses
                ?.GroupBy(f => f.Value.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(g => new FieldResponseWithResponseCountDto
                {
                    FieldId = formField.Id,
                    Value = g.Key,
                    ResponseCount = g.Count()
                }).ToList();

            return new FormFieldDto
            {
                Id = formField.Id,
                FormId = formField.FormId,
                Label = formField.Label,
                FieldType = formField.FieldType,
                ImageUrl = formField.ImageUrl,
                Required = formField.Required,
                Order = formField.Order,
                Options = formField.FormFieldOptions?.Select(option => option.ToFormFieldOptionDto()).ToList(),
                Responses = responses
            };
        }



        public static FormField ToFormFieldFromCreate(this CreateFormFieldDto formFieldDto, int formId)
        {
            return new FormField
            {
                FormId = formId,
                Label = formFieldDto.Label,
                FieldType = formFieldDto.FieldType,
                ImageUrl = formFieldDto.ImageUrl,
                Required = formFieldDto.Required
                
            };
        }
        public static FormField ToFormFieldFromUpdate(this UpdateFormFieldDto formFieldDto)
        {
            return new FormField
            {
                Label = formFieldDto.Label,
                FieldType = formFieldDto.FieldType,
                ImageUrl = formFieldDto.ImageUrl,
                Required = formFieldDto.Required
            };
        }
    }
}
