using api.Controllers;
using api.Dtos.Form;
using api.Interfaces;
using api.Models;
using api.Mappers;
using FakeItEasy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;


namespace api.Tests.Controller
{
    public class FormControllerTest
    {
        private readonly IFormRepository _formRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly FormController _formController;

        public FormControllerTest()
        {
            _formRepository = A.Fake<IFormRepository>();
            _userManager = A.Fake<UserManager<AppUser>>();
            _formController = new FormController(_userManager, _formRepository);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname", "testuser"),
                new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "123")
            }, "mock"));

            _formController.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        [Fact]
        public async Task FormController_GetAll_ReturnOk()
        {
            // Arrange
            var fakeForms = new List<Form>
            {
                new Form { Id = 1, Title = "Test Form 1" },
                new Form { Id = 2, Title = "Test Form 2" }
            };

            A.CallTo(() => _formRepository.GetALlAsync()).Returns(Task.FromResult(fakeForms));
            
            // Act
            var result = await _formController.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnForms = Assert.IsAssignableFrom<IEnumerable<FormDto>>(okResult.Value);
            Assert.Equal(2, returnForms.Count());
        }

        [Fact]
        public async Task FormController_Create_ReturnsCreatedAtAction()
        {
            // Arrange
            var fakeUser = new AppUser { Id = "123", UserName = "testuser" };
            A.CallTo(() => _userManager.FindByNameAsync("testuser"))
                .Returns(Task.FromResult(fakeUser));

            var formDto = new CreateFormDto
            {
                Title = "New Form",
                Description = "Form description"
            };

            var expectedForm = formDto.ToFormFromCreate(fakeUser.Id);
            expectedForm.Id = 1; // simulate DB assigning an ID

            A.CallTo(() => _formRepository.CreateAsync(A<Form>._))
                .Invokes((Form f) => f.Id = expectedForm.Id) // assign ID after creation
                .Returns(Task.FromResult(expectedForm));

            // Act
            var result = await _formController.Create(formDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnForm = Assert.IsType<Form>(createdAtActionResult.Value);
            Assert.Equal("New Form", returnForm.Title);
            Assert.Equal(1, returnForm.Id); 
        }

        [Fact]
        public async Task FormController_Delete_ReturnsOk()
        {
            // Arrange
            var formId = 1;
            var fakeForm = new Form { Id = formId, Title = "To Delete", UserId = "123" };

            A.CallTo(() => _formRepository.DeleteAsync(formId))
                .Returns(Task.FromResult(fakeForm));

            // Act
            var result = await _formController.Delete(formId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnForm = Assert.IsType<Form>(okResult.Value);
            Assert.Equal(formId, returnForm.Id);
            Assert.Equal("To Delete", returnForm.Title);
        }

        [Fact]
        public async Task FormController_Update_ReturnsOk()
        {
            // Arrange
            var formId = 1;
            var fakeUser = new AppUser { Id = "123", UserName = "testuser" };
            A.CallTo(() => _userManager.FindByNameAsync("testuser"))
                .Returns(Task.FromResult(fakeUser));

            var updateDto = new UpdateFormDto
            {
                Title = "Updated Title",
                Description = "Updated Description",
                Status = "Draft",
                Type = "Quiz"
            };

            var updatedForm = new Form
            {
                Id = formId,
                Title = updateDto.Title,
                Description = updateDto.Description,
                Status = updateDto.Status,
                Type = updateDto.Type,
                UserId = fakeUser.Id
            };

            A.CallTo(() => _formRepository.UpdateAsync(formId, A<Form>._))
                .Returns(Task.FromResult(updatedForm));

            // Act
            var result = await _formController.Update(formId, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnFormDto = Assert.IsType<FormDto>(okResult.Value);
            Assert.Equal("Updated Title", returnFormDto.Title);
            Assert.Equal("Updated Description", returnFormDto.Description);
            Assert.Equal("Draft", returnFormDto.Status);
            Assert.Equal("Quiz", returnFormDto.Type);
        }



    }
}
