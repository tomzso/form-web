using Microsoft.AspNetCore.Identity;

namespace api.Models
{
    public class AppUser: IdentityUser
    {
        // Navigation Properties
        public List<Form>? Forms { get; set; }
        public List<FormResponse>? FormResponses { get; set; }
    }
}
