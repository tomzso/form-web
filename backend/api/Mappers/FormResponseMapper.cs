using api.Dtos.FormResponse;
using api.Models;

namespace api.Mappers
{
    public static class FormResponseMapper
    {
        public static FormResponseDto ToFormResponseDto(this FormResponse formResponse) 
        {
            return new FormResponseDto
            {
                Id = formResponse.Id,
                FormId = formResponse.FormId,
                UserId = formResponse.UserId,
                SubmittedAt = formResponse.SubmittedAt,
                FieldResponses = formResponse.FieldResponses?.Select(fieldResponse => fieldResponse.ToFieldResponseDto()).ToList()
            };

        }
    }
}
