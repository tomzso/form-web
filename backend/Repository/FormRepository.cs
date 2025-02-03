using api.Data;
using api.Interfaces;
using api.Models;
using api.Mappers;
using Microsoft.EntityFrameworkCore;
using api.Dtos.Form;
using api.Dtos.FormField;
using api.Helper;

namespace api.Repository
{
    public class FormRepository : IFormRepository
    {
        private readonly ApplicationDBContext _context;
        public FormRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<Form>> GetALlAsync()
        {
            return await _context.Forms
                .Include(f => f.FormFields)
                .ThenInclude(ff => ff.FormFieldOptions)
                .ToListAsync();
        }

        public async Task<List<Form>> GetByUserIdAsync(AppUser user, FormQueryObject formQueryObject )
        {
            var forms = _context.Forms
                    //.Include(f => f.FormFields)
                    //.ThenInclude(ff => ff.FormFieldOptions)
                    .Where(form => form.UserId == user.Id);



            if(!string.IsNullOrWhiteSpace(formQueryObject.Title))
            {
                forms = forms.Where(form => form.Title.Contains(formQueryObject.Title));
            }
            return await forms.ToListAsync();
        
        }

        public async Task<Form?> GetByIdAsync(int id)
        {
            return await _context.Forms
                .Include(f => f.FormFields)
                    .ThenInclude(ff => ff.FormFieldOptions)
                .Include(f => f.FormFields)
                    .ThenInclude(ff => ff.FieldResponses)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Form?> GetByUrlAsync(string url)
        {
            return await _context.Forms.Include(f => f.FormFields).ThenInclude(ff => ff.FormFieldOptions).FirstOrDefaultAsync(x => x.Url == url);
        }

        public async Task<Form> CreateAsync(Form form)
        {
            await _context.Forms.AddAsync(form);
            await _context.SaveChangesAsync();
            return form;
        }

        public async Task<Form?> UpdateAsync(int id, Form form)
        {
            var existingForm = _context.Forms.Find(id);
            if (existingForm == null) return null;
            existingForm.Title = form.Title;
            existingForm.Description = form.Description;
            existingForm.Status = form.Status;
            existingForm.Type = form.Type;
            await _context.SaveChangesAsync();
            return existingForm;
        }

        public async Task<Form?> DeleteAsync(int id)
        {
            var existingForm = await _context.Forms.FirstOrDefaultAsync(form => form.Id == id);
            if (existingForm == null) return null;
            _context.Forms.Remove(existingForm);
            await _context.SaveChangesAsync();
            return existingForm;

        }

        public async Task<bool> FormExists(int id)
        {
            return await _context.Forms.AnyAsync(form => form.Id == id);
        }




    }
}
