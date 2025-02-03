using api.Dtos.FieldResponse;
using api.Models;

namespace api.Mappers
{
    public static class FieldResponseMapper
    {
        public static FieldResponseDto ToFieldResponseDto(this FieldResponse fieldResponse)
        {
            return new FieldResponseDto
            {
                Id = fieldResponse.Id,
                ResponseId = fieldResponse.ResponseId,
                FieldId = fieldResponse.FieldId,
                Value = fieldResponse.Value,
                
            };
        }
        public static FieldResponse ToFieldResponseFromCreate(this CreateFieldResponseDto createFieldResponseDto)
        {
            return new FieldResponse
            {
                ResponseId = createFieldResponseDto.ResponseId,
                FieldId = createFieldResponseDto.FieldId,
                Value = createFieldResponseDto.Value.Trim(),
            };
        }


    }
}
