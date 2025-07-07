using api.Controllers;
using api.Dtos.Account;
using api.Interfaces;
using api.Models;
using FakeItEasy;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MockQueryable;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace api.Tests.Controller
{
    public class AccountControllerTest
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IAuthenticationService _authService;
        private readonly AccountController _controller;

        private UserManager<AppUser> GetFakeUserManager()
        {
            var store = A.Fake<IUserStore<AppUser>>();
            return new UserManager<AppUser>(
                store, null, null, null, null, null, null, null, null);
        }

        private SignInManager<AppUser> GetFakeSignInManager(UserManager<AppUser> userManager)
        {
            var contextAccessor = A.Fake<IHttpContextAccessor>();
            var claimsFactory = A.Fake<IUserClaimsPrincipalFactory<AppUser>>();

            return new SignInManager<AppUser>(
                userManager, contextAccessor, claimsFactory, null, null, null, null);
        }

        public AccountControllerTest()
        {
            _userManager = A.Fake<UserManager<AppUser>>(options => options.Wrapping(GetFakeUserManager()));
            _signInManager = A.Fake<SignInManager<AppUser>>(options => options.Wrapping(GetFakeSignInManager(_userManager)));
            _tokenService = A.Fake<ITokenService>();
            _authService = A.Fake<IAuthenticationService>();

            _controller = new AccountController(_userManager, _tokenService, _signInManager, _authService);
        }

        
        [Fact]
        public async Task Register_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Test1234"
            };

            var user = new AppUser { UserName = registerDto.Username, Email = registerDto.Email };

            A.CallTo(() => _userManager.CreateAsync(A<AppUser>.Ignored, registerDto.Password))
                .Returns(IdentityResult.Success);

            A.CallTo(() => _userManager.AddToRoleAsync(A<AppUser>.Ignored, "User"))
                .Returns(IdentityResult.Success);

            A.CallTo(() => _tokenService.CreateToken(A<AppUser>.Ignored)).Returns("fake-jwt-token");

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var userDto = Assert.IsType<NewUserDto>(okResult.Value);
            Assert.Equal("testuser", userDto.Username);
            Assert.Equal("test@example.com", userDto.Email);
            Assert.Equal("fake-jwt-token", userDto.Token);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenCredentialsValid()
        {
            // Arrange
            var loginDto = new LoginDto { Username = "testuser", Password = "Test1234" };
            var user = new AppUser { UserName = loginDto.Username, Email = "test@example.com", Id = "123" };

            A.CallTo(() => _userManager.Users).Returns(new List<AppUser> { user }.AsQueryable().BuildMock());
            A.CallTo(() => _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false))
                .Returns(SignInResult.Success);
            A.CallTo(() => _tokenService.CreateToken(user)).Returns("fake-jwt-token");

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var userDto = Assert.IsType<NewUserDto>(okResult.Value);
            Assert.Equal("testuser", userDto.Username);
            Assert.Equal("test@example.com", userDto.Email);
            Assert.Equal("fake-jwt-token", userDto.Token);
        }
    }
}
