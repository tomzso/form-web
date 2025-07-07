using api.Data;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;
using System.Formats.Asn1;

namespace api.Repository
{
    public class FormFieldOptionRepository: IFormFieldOptionRepository
    {
        private readonly ApplicationDBContext _context;
        public FormFieldOptionRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<FormFieldOption> CreateAsync(FormFieldOption formFieldOption)
        {
            await _context.FormFieldOptions.AddAsync(formFieldOption);
            await _context.SaveChangesAsync();
            return formFieldOption;
        }
        public async Task<FormFieldOption> CreateTextAsync(FormFieldOption formFieldOption, int fieldId, string optionValue)
        {
            var result = await _context.FormFieldOptions.FirstOrDefaultAsync(x => x.FieldId == fieldId && x.OptionValue.ToLower() == optionValue.ToLower());
            if (result != null) return null;
            await _context.FormFieldOptions.AddAsync(formFieldOption);
            await _context.SaveChangesAsync();
            return formFieldOption;
        }

        public async Task<FormFieldOption> DeleteAsync(int id)
        {
            var formFieldOptionToDelete = await _context.FormFieldOptions.FirstOrDefaultAsync(x => x.Id == id);
            if (formFieldOptionToDelete != null) return null;
            _context.FormFieldOptions.Remove(formFieldOptionToDelete);
            await _context.SaveChangesAsync();
            return formFieldOptionToDelete;
        }

        public async Task<bool> FormFieldOptionExits(int id)
        {
            return await _context.FormFieldOptions.AnyAsync(x => x.Id == id);
        }

        public async Task<List<FormFieldOption>> GetAllAsync()
        {
            return await _context.FormFieldOptions.ToListAsync();
        }

        public async Task<FormFieldOption> GetByIdAsync(int id)
        {
            return await _context.FormFieldOptions.FindAsync(id);
        }

        public async Task<FormFieldOption?> GetByFieldIdAsync(int fieldId)
        {
            return await _context.FormFieldOptions.FirstOrDefaultAsync(x => x.FieldId == fieldId);
        }
        public async Task<FormFieldOption?> GetByFieldIdAndOptionValueAsync(int fieldId, string optionValue)
        {
            return await _context.FormFieldOptions.FirstOrDefaultAsync(x => x.FieldId == fieldId && x.OptionValue.ToLower() == optionValue.ToLower());
        }

        public async Task<FormFieldOption?> UpdateAsync(int id, FormFieldOption formFieldOption)
        {
            var formFieldOptionToUpdate = await _context.FormFieldOptions.FindAsync(id);
            if (formFieldOptionToUpdate == null) return null;
            formFieldOptionToUpdate.FieldId = formFieldOption.FieldId;
            formFieldOptionToUpdate.OptionValue = formFieldOption.OptionValue;
            formFieldOptionToUpdate.Order = formFieldOption.Order;
            await _context.SaveChangesAsync();
            return formFieldOptionToUpdate;
        }

        public async Task<bool> IncrementResponseCountAsync(int id)
        {
            var formFieldOption = await _context.FormFieldOptions.FindAsync(id);
            if (formFieldOption == null) return false;

            formFieldOption.ResponseCount += 1;
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
