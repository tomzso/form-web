using api.Dtos.FormResponse;
using api.Extensions;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace api.Controllers
{
    [Route("api/formresponse")]
    [ApiController]
    public class FormResponseController: ControllerBase
    {
        private readonly IFormRepository _formRepository;
        private readonly IFormResponseRepository _formResponseRepository;
        private readonly UserManager<AppUser> _userManager;

        public FormResponseController(IFormResponseRepository formResponseRepository, IFormRepository formRepository,
            UserManager<AppUser> userManager)
        {
            _formResponseRepository = formResponseRepository;
            _formRepository = formRepository;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var formResponses = await _formResponseRepository.GetAllAsync();
            var formResponseDtos = formResponses.Select(formResponse => formResponse.ToFormResponseDto());
            return Ok(formResponseDtos);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {


            var formResponse = await _formResponseRepository.GetByIdAsync(id);
            if (formResponse == null)
            {
                return NotFound();
            }
            return Ok(formResponse.ToFormResponseDto());
        }

        [Authorize]
        [HttpGet("formid/{formid}")]
        public async Task<IActionResult> GetByFormId(int formid)
        {
            var userName = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(userName);
            var appUserId = appUser.Id;

            var formResponse = await _formResponseRepository.GetByFormIdAsync(formid, appUserId);
            if (formResponse == null)
            {
                return NotFound();
            }
            return Ok(formResponse.ToFormResponseDto());
        }

        [Authorize]
        [HttpPost("{formId}")]
        public async Task<IActionResult> Create([FromRoute] int formId)
        {
            var userName = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(userName);

            if (!await _formRepository.FormExists(formId)) return BadRequest("Form does not exist");
            var formResponse = new FormResponse
            {
                FormId = formId,
                UserId = appUser.Id
            };
            await _formResponseRepository.CreateAsync(formResponse);
            return CreatedAtAction(nameof(GetById), new { id = formResponse.Id }, formResponse);
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var formResponse = await _formResponseRepository.GetByIdAsync(id);
            if (formResponse == null) return NotFound();
            await _formResponseRepository.DeleteAsync(id);
            return NoContent();
        }




    }
}
