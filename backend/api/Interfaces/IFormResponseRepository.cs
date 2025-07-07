using api.Models;

namespace api.Interfaces
{
    public interface IFormResponseRepository
    {
        public Task<List<FormResponse>> GetAllAsync();
        public Task<FormResponse> GetByIdAsync(int id);
        public Task<FormResponse> CreateAsync(FormResponse formResponse);
        public Task<FormResponse> GetByFormIdAsync(int formId, string UserId);
        public Task<FormResponse> DeleteAsync(int id);
    }
}
