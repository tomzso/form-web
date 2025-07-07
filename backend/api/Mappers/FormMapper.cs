using api.Dtos.Form;
using api.Dtos.FormField;
using api.Models;

namespace api.Mappers
{
    public static class FormMapper
    {
        public static FormDto ToFormDto(this Form form)
        {
            return new FormDto
            {
                Id = form.Id,
                Title = form.Title,
                Description = form.Description,
                Status = form.Status,
                Type = form.Type,
                CreatedAt = form.CreatedAt,
                Url = form.Url,

                UserId = form.UserId,
                FormFields = form.FormFields?.Select(field => field.ToFormFieldDto()).ToList()

            };
        }

        public static Form ToFormFromCreate(this CreateFormDto createFormDto, string appUserId)
        {
            return new Form
            {
                Title = createFormDto.Title,
                Description = createFormDto.Description,
                Status = createFormDto.Status,
                Type = createFormDto.Type,
                UserId = appUserId,
                Url = string.IsNullOrEmpty(createFormDto.Url) ? new Form().Url : createFormDto.Url

            };
        }
        public static Form ToFormFromUpdate(this UpdateFormDto createFormDto, string appUserId)
        {
            return new Form
            {
                Title = createFormDto.Title,
                Description = createFormDto.Description,
                Status = createFormDto.Status,
                Type = createFormDto.Type,
                UserId = appUserId

            };
        }
    }
}
