
using api.Dtos.FieldResponse;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/fieldresponse")]
    [ApiController]
    public class FieldResponseController: ControllerBase
    {

        private readonly IFieldResponseRepository _fieldResponseRepository;
        private readonly IFormFieldOptionRepository _formFieldOptionRepository;

        public FieldResponseController(IFieldResponseRepository fieldResponseRepository, IFormFieldOptionRepository formFieldOptionRepository)
        {
            _fieldResponseRepository = fieldResponseRepository;
            _formFieldOptionRepository = formFieldOptionRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fieldResponses = await _fieldResponseRepository.GetAllAsync();
            var fieldResponseDtos = fieldResponses.Select(fieldResponse => fieldResponse.ToFieldResponseDto());
            return Ok(fieldResponseDtos);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var fieldResponse = await _fieldResponseRepository.GetByIdAsync(id);
            if (fieldResponse == null)
            {
                return NotFound();
            }
            return Ok(fieldResponse.ToFieldResponseDto());
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFieldResponseDto fieldResponseDto)
        {
            var fieldResponse = fieldResponseDto.ToFieldResponseFromCreate();
            var formFieldOption = await _formFieldOptionRepository.GetByFieldIdAndOptionValueAsync(fieldResponse.FieldId, fieldResponse.Value);
            if (formFieldOption is not null)
            {
                await _formFieldOptionRepository.IncrementResponseCountAsync(formFieldOption.Id);
            }
            await _fieldResponseRepository.CreateAsync(fieldResponse);
            
            return CreatedAtAction(nameof(GetById), new { id = fieldResponse.Id }, fieldResponse);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateFieldResponseDto fieldResponseDto)
        {
            var fieldResponse = await _fieldResponseRepository.UpdateAsync(id, fieldResponseDto);
            if (fieldResponse == null)
            {
                return NotFound();
            }
            return Ok(fieldResponse.ToFieldResponseDto());
 
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var fieldResponse = await _fieldResponseRepository.DeleteAsync(id);
            if (fieldResponse == null)
            {
                return NotFound();
            }
            return Ok(fieldResponse.ToFieldResponseDto());
        }


    }
}
