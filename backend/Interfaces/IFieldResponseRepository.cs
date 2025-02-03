using api.Dtos.FieldResponse;
using api.Models;

namespace api.Interfaces
{
    public interface IFieldResponseRepository
    {
        public Task<List<FieldResponse>> GetAllAsync();
        public Task<FieldResponse> GetByIdAsync(int id);
        public Task<FieldResponse> CreateAsync(FieldResponse fieldResponse);
        public Task<FieldResponse> UpdateAsync(int id, UpdateFieldResponseDto fieldResponseDto);
        public Task<FieldResponse> DeleteAsync(int id);
    }
}
