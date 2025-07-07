using api.Data;
using api.Dtos.FieldResponse;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public class FieldResponseRepository: IFieldResponseRepository
    {
        private readonly ApplicationDBContext _context;
        public FieldResponseRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<FieldResponse> CreateAsync(FieldResponse fieldResponse)
        {
            await _context.FieldResponses.AddAsync(fieldResponse);
            await _context.SaveChangesAsync();
            return fieldResponse;
        }

        public async Task<List<FieldResponse>> GetAllAsync()
        {
            return await _context.FieldResponses.ToListAsync();
        }

        public async Task<FieldResponse> GetByIdAsync(int id)
        {
            return await _context.FieldResponses.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<FieldResponse> UpdateAsync(int id, UpdateFieldResponseDto fieldResponseDto)
        {
             var fieldResponse = await _context.FieldResponses.FirstOrDefaultAsync(x => x.Id == id);
            if (fieldResponse == null) return null;
            fieldResponse.Value = fieldResponseDto.Value;
            await _context.SaveChangesAsync();
            return fieldResponse;
        }
        public async Task<FieldResponse> DeleteAsync(int id)
        {
            var fieldResponse = await _context.FieldResponses.FirstOrDefaultAsync(x => x.Id == id);
            if (fieldResponse == null) return null;
            _context.FieldResponses.Remove(fieldResponse);
            await _context.SaveChangesAsync();
            return fieldResponse;
        }
    }
}
