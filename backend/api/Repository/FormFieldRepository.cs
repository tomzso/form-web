using api.Data;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public class FormFieldRepository: IFormFieldRepository
    {
        private readonly ApplicationDBContext _context;
        public FormFieldRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<FormField>> GetALlAsync()
        {
            return await _context.FormFields.Include(f => f.FormFieldOptions).ToListAsync();
        }

        public async Task<FormField?> GetByIdAsync(int id)
        {
            return await _context.FormFields.Include(f => f.FormFieldOptions).FirstOrDefaultAsync(f => f.Id ==id );
        }
        public async Task<FormField> CreateAsync(FormField formField)
        {
            await _context.FormFields.AddAsync(formField);
            await _context.SaveChangesAsync();
            return formField;
        }

        public async Task<FormField> UpdateAsync(int id, FormField formField)
        {
            var existingFormField = _context.FormFields.Find(id);
            if (existingFormField == null) return null;
            existingFormField.Label = formField.Label;
            existingFormField.FieldType = formField.FieldType;
            existingFormField.Required = formField.Required;
            await _context.SaveChangesAsync();
            return existingFormField;

        }

        public async Task<FormField?> DeleteAsync(int id)
        {
            var formField = await _context.FormFields.FirstOrDefaultAsync(formField => formField.Id == id);
            if (formField == null) return null;
            _context.FormFields.Remove(formField);
            await _context.SaveChangesAsync();
            return formField;
        }

        public Task<bool> FormFieldExists(int id)
        {
            return _context.FormFields.AnyAsync(x => x.Id == id);
        }
    }
}
