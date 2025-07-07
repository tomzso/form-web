using api.Models;

namespace api.Interfaces
{
    public interface IFormFieldOptionRepository
    {
        Task<List<FormFieldOption>> GetAllAsync();

        Task<FormFieldOption> GetByIdAsync(int id);

        Task<bool> FormFieldOptionExits(int id);
        Task<FormFieldOption> CreateAsync(FormFieldOption formFieldOption);
        Task<FormFieldOption> CreateTextAsync(FormFieldOption formFieldOption, int fieldId, string optionValue);

        Task<FormFieldOption> UpdateAsync(int id, FormFieldOption formFieldOption);

        Task<FormFieldOption> DeleteAsync(int id);
        Task<FormFieldOption?> GetByFieldIdAsync(int fieldId);
        Task<FormFieldOption?> GetByFieldIdAndOptionValueAsync(int fieldId, string optionValue);
        Task<bool> IncrementResponseCountAsync(int id);

    }
}
