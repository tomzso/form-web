using api.Dtos.Form;
using api.Dtos.FormField;
using api.Extensions;
using api.Helper;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace api.Controllers
{

 
    [Route("api/form")]
    [ApiController]
    public class FormController: ControllerBase
    {
        private readonly IFormRepository _formRepository;
        private readonly UserManager<AppUser> _userManager;
        public FormController(UserManager<AppUser> userManager,
            IFormRepository formRepository)
        {
            _formRepository = formRepository;
            _userManager = userManager;
        }

        [HttpGet("all")]

        public async Task<IActionResult> GetAll()
        {

            var forms = await _formRepository.GetALlAsync();
            var formDtos = forms.Select(form => form.ToFormDto());
            return Ok(formDtos);
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetAllByUser([FromQuery] FormQueryObject query)
        {
            var userName = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(userName);

            var userForms = await _formRepository.GetByUserIdAsync(appUser, query);
            var formDtos = userForms.Select(form => form.ToFormDto());
            return Ok(formDtos);
        }
        [HttpGet("url/{url}")]
        [Authorize]
        public async Task<IActionResult> GetByUrl(string url)
        {
            var form = await _formRepository.GetByUrlAsync(url);
            if (form == null) return NotFound();
            return Ok(form.ToFormDto());
        }

        [HttpGet("{id}")] 
        public async Task<IActionResult> GetById(int id)
        {
            var form = await _formRepository.GetByIdAsync(id);
            if (form == null) return NotFound();
            return Ok(form.ToFormDto());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateFormDto formDto)
        {
            var userName = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(userName);
            var appUserId = appUser.Id;

            var form = formDto.ToFormFromCreate(appUserId);
            await _formRepository.CreateAsync(form);
            return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
        }
        [HttpPut]
        [Route("{id}")]
        [Authorize]
        public async Task<IActionResult> Update([FromRoute]int id, [FromBody] UpdateFormDto formDto)
        {
            var userName = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(userName);
            var appUserId = appUser.Id;

            var form = await _formRepository.UpdateAsync(id, formDto.ToFormFromUpdate(appUserId));
            if (form == null) NotFound("Form not found");
            return Ok(form.ToFormDto());

        }
        [HttpDelete]
        [Route("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var form = await _formRepository.DeleteAsync(id);
            if (form == null) return NotFound("Form not found");
            return Ok(form);
        }
    }
}
