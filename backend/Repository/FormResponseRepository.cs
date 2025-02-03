using api.Data;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public class FormResponseRepository: IFormResponseRepository
    {
        private readonly ApplicationDBContext _context;
        public FormResponseRepository(ApplicationDBContext context) { 
            _context = context;
        }

        public async Task<FormResponse> CreateAsync(FormResponse formResponse)
        {
            await _context.FormResponses.AddAsync(formResponse);
            await _context.SaveChangesAsync();
            return formResponse;

        }

        public async Task<List<FormResponse>> GetAllAsync()
        {
            return await _context.FormResponses.Include(f => f.FieldResponses).ToListAsync();
        }

        public async Task<FormResponse> GetByIdAsync(int id)
        {
            return await _context.FormResponses.Include(f => f.FieldResponses).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<FormResponse> GetByFormIdAsync(int formId, string UserId)
        {
            return await _context.FormResponses.Include(f => f.FieldResponses).FirstOrDefaultAsync(x => x.FormId == formId && x.UserId == UserId);
        }
        public async Task<FormResponse> DeleteAsync(int id)
        {
            var formResponseToDelete = await _context.FormResponses.FirstOrDefaultAsync(x => x.Id == id);
            if (formResponseToDelete == null) return null;
            _context.FormResponses.Remove(formResponseToDelete);
            await _context.SaveChangesAsync();
            return formResponseToDelete;
        }
    }
}
