using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace api.Extensions
{
    public static class ClaimsExtensions
    {
        public static string GetUsername(this ClaimsPrincipal user)
        {
            return user.Claims.SingleOrDefault(x => x.Type.Equals("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname")).Value;
        }

        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.Claims.SingleOrDefault(x => x.Type.Equals("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"))?.Value;
        }
    }
}
