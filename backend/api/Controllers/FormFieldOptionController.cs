using api.Dtos.FormFieldOption;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/formfieldoption")]
    [ApiController]
    public class FormFieldOptionController: ControllerBase
    {
        private readonly IFormFieldOptionRepository _formFieldOptionRepository;
        private readonly IFormFieldRepository _formFieldRepository;

        public FormFieldOptionController(IFormFieldOptionRepository formFieldOptionRepository, IFormFieldRepository formFieldRepository)
        {
            _formFieldOptionRepository = formFieldOptionRepository;
            _formFieldRepository = formFieldRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var formFieldOptions = await _formFieldOptionRepository.GetAllAsync();
            var formFieldOptionDtos = formFieldOptions.Select(formFieldOption => formFieldOption.ToFormFieldOptionDto());
            return Ok(formFieldOptionDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var formFieldOption = await _formFieldOptionRepository.GetByIdAsync(id);
            if (formFieldOption == null) return NotFound();
            return Ok(formFieldOption.ToFormFieldOptionDto());
        }
        [HttpPost("{formFieldId}")]
        public async Task<IActionResult> Create([FromRoute] int formFieldId, [FromBody] CreateFormFieldOptionDto formFieldOptionDto)
        {
            if(!await _formFieldRepository.FormFieldExists(formFieldId)) return BadRequest("Form Field does not exist");
            var formFieldOption = formFieldOptionDto.ToFormFieldOptionFromCreate(formFieldId);
            await _formFieldOptionRepository.CreateAsync(formFieldOption);
            return CreatedAtAction(nameof(GetById), new { id = formFieldOption.Id }, formFieldOption);
        }
        [HttpPost("text/{formFieldId}")]
        public async Task<IActionResult> CreateText([FromRoute] int formFieldId, [FromBody] CreateFormFieldOptionDto formFieldOptionDto)
        {
            if (!await _formFieldRepository.FormFieldExists(formFieldId)) return BadRequest("Form Field does not exist");
            var formFieldOption = formFieldOptionDto.ToFormFieldOptionFromCreate(formFieldId);
            await _formFieldOptionRepository.CreateTextAsync(formFieldOption, formFieldId, formFieldOption.OptionValue);
            if (formFieldOption == null) return BadRequest("The form field option already exists.");
            return CreatedAtAction(nameof(GetById), new { id = formFieldOption.Id }, formFieldOption);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFormFieldOptionDto formFieldOptionDto)
        {

            var formFieldOption = await _formFieldOptionRepository.UpdateAsync(id, formFieldOptionDto.ToFormFieldOptionFromUpdate());
            if (formFieldOption == null) return NotFound();
            return Ok(formFieldOption.ToFormFieldOptionDto());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var formFieldOption = await _formFieldOptionRepository.DeleteAsync(id);
            if (formFieldOption == null) return NotFound();
            return Ok(formFieldOption.ToFormFieldOptionDto());
        }

    }
}
