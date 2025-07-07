using api.Helper;
using api.Models;

namespace api.Interfaces
{
    public interface IFormRepository
    {
        Task<List<Form>> GetALlAsync();
        Task<List<Form>> GetByUserIdAsync(AppUser user, FormQueryObject formQueryObject);
        Task<Form> GetByIdAsync(int id);
        Task<Form> CreateAsync (Form form);
        Task<Form?> UpdateAsync (int id, Form form);
        Task<Form?> DeleteAsync (int id);
        Task<bool> FormExists(int id);
        Task<Form?> GetByUrlAsync(string url);

    }
}
