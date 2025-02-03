using api.Models;

namespace api.Interfaces
{
    public interface IFormFieldRepository
    {
        Task<List<FormField>> GetALlAsync();
        Task<FormField> GetByIdAsync(int id);
        Task<FormField> CreateAsync(FormField formField);
        Task<FormField> UpdateAsync(int id, FormField formField);
        Task<FormField?> DeleteAsync(int id);
        Task<bool> FormFieldExists(int id);

    }
}
