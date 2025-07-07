using api.Data;
using api.Helper;
using api.Models;
using api.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestPlatform.ObjectModel.DataCollection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace api.Tests.Respository
{
    public class FormRepositoryTest
    {

        private async Task<ApplicationDBContext> GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
                .Options;

            var dbContext = new ApplicationDBContext(options);
            await dbContext.Database.EnsureCreatedAsync();

            // Insert 10 random forms
            var formList = new List<Form>();
            for (int i = 1; i <= 10; i++)
            {
                formList.Add(new Form
                {
                    Title = $"Form {i}",
                    Description = $"Description {i}",
                    Status = "",
                    Type = "Form",
                    UserId = $"user{i}",
                });
            }

            await dbContext.Forms.AddRangeAsync(formList);
            await dbContext.SaveChangesAsync();

            return dbContext;
        }

        [Fact]
        public async void FormRepository_GetByIdAsync_ReturnForm()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);
            var expectedId = 1;

            // Act
            var form = await formRepository.GetByIdAsync(expectedId);

            // Assert
            Assert.NotNull(form);
            Assert.Equal(expectedId, form.Id);
            Assert.Equal($"Form {expectedId}", form.Title);

        }

        [Fact]
        public async Task FormRepository_GetAllAsync_ReturnsAllForms()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);

            // Act
            var forms = await formRepository.GetALlAsync();

            // Assert
            Assert.NotNull(forms);
            Assert.Equal(10, forms.Count());
            Assert.Contains(forms, f => f.Title == "Form 1");
            Assert.Contains(forms, f => f.Title == "Form 10");
        }

        [Fact]
        public async Task FormRepository_CreateAsync_AddsFormToDatabase()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);

            var newForm = new Form
            {
                Title = "New Test Form",
                Description = "New Description",
                UserId = "new_user_123"
            };

            // Act
            await formRepository.CreateAsync(newForm);
            var allForms = await formRepository.GetALlAsync();

            // Assert
            Assert.Equal(11, allForms.Count()); // 10 seeded + 1 added
            var addedForm = allForms.FirstOrDefault(f => f.Title == "New Test Form");
            Assert.NotNull(addedForm);
            Assert.Equal("New Description", addedForm.Description);
            Assert.Equal("new_user_123", addedForm.UserId);
        }

        [Fact]
        public async Task FormRepository_UpdateAsync_UpdatesFormInDatabase()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);
            var formIdToUpdate = 1;

            var updatedForm = new Form
            {
                Title = "Updated Title",
                Description = "Updated Description",
                Status = "Draft",
                Type = "Quiz",
            };

            // Act
            var result = await formRepository.UpdateAsync(formIdToUpdate, updatedForm);
            var formFromDb = await formRepository.GetByIdAsync(formIdToUpdate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", formFromDb.Title);
            Assert.Equal("Updated Description", formFromDb.Description);
            Assert.Equal("Draft", formFromDb.Status);
            Assert.Equal("Quiz", formFromDb.Type);
        }

        [Fact]
        public async Task FormRepository_DeleteAsync_DeletesFormFromDatabase()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);
            var formIdToDelete = 1;

            // Ensure the form exists before deletion
            var existingForm = await formRepository.GetByIdAsync(formIdToDelete);
            Assert.NotNull(existingForm);

            // Act
            var deletedForm = await formRepository.DeleteAsync(formIdToDelete);
            var formAfterDeletion = await formRepository.GetByIdAsync(formIdToDelete);

            // Assert
            Assert.NotNull(deletedForm);
            Assert.Equal(formIdToDelete, deletedForm.Id);
            Assert.Null(formAfterDeletion);
        }

        [Fact]
        public async Task FormRepository_GetByUserIdAsync_ReturnsFilteredForms()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);
            var user = new AppUser { Id = "user1" };

            var query = new FormQueryObject
            {
                Title = "Form 1"
            };

            // Act
            var result = await formRepository.GetByUserIdAsync(user, query);

            // Assert
            Assert.Single(result);
            Assert.Equal("Form 1", result.First().Title);
            Assert.Equal("user1", result.First().UserId);
        }

        [Fact]
        public async Task FormRepository_FormExists_ReturnsCorrectly()
        {
            // Arrange
            var dbContext = await GetDatabaseContext();
            var formRepository = new FormRepository(dbContext);

            // Act
            var exists = await formRepository.FormExists(1);    
            var doesNotExist = await formRepository.FormExists(999); 

            // Assert
            Assert.True(exists);
            Assert.False(doesNotExist);
        }


    }


}

