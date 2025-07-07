using api.Dtos.FormField;
using api.Interfaces;
using api.Mappers;
using api.Models;
using api.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/formfield")]
    [ApiController]
    public class FormFieldController: ControllerBase
    {
        private readonly IFormFieldRepository _formFieldRepository;
        private readonly IFormRepository _formRepository;
        public FormFieldController(IFormFieldRepository formFieldRepository, IFormRepository formRepository)
        {
            _formFieldRepository = formFieldRepository;
            _formRepository = formRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var formFields = await _formFieldRepository.GetALlAsync();
            var formFieldDtos = formFields.Select(formField => formField.ToFormFieldDto());
            return Ok(formFieldDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var formField = await _formFieldRepository.GetByIdAsync(id);
            if (formField == null) return NotFound();
            return Ok(formField);
        }
        [HttpPost("{formId}")]
        public async Task<IActionResult> Create([FromRoute] int formId, [FromBody] CreateFormFieldDto formFieldDto)
        {
            if(!await _formRepository.FormExists(formId)) return BadRequest("Form does not exist");
            var formField = formFieldDto.ToFormFieldFromCreate(formId);
            await _formFieldRepository.CreateAsync(formField);
            return CreatedAtAction(nameof(GetById), new { id = formField.Id }, formField);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFormFieldDto formFieldDto)
        {

            var formField = await _formFieldRepository.UpdateAsync(id, formFieldDto.ToFormFieldFromUpdate());
            if (formField == null) return NotFound();
            return Ok(formField.ToFormFieldDto());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var formField = await _formFieldRepository.DeleteAsync(id);
            if (formField == null) return NotFound();
            return Ok(formField);
        }

    }
}
