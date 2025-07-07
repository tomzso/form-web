using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace api.Models
{
    public class Form
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // URL Property
        public string Url { get;  set; }

        // Foreign Key to User (IdentityUser)
        public string? UserId { get; set; }

        // Navigation Properties
        public AppUser? User { get; set; }
        public List<FormField>? FormFields { get; set; }
        public List<FormResponse>? FormResponses { get; set; }

        // Constructor
        public Form()
        {
            // Generate a random URL when the object is created
            Url = GenerateRandomUrl();
        }

        private string GenerateRandomUrl()
        {
            // Base domain or URL
            string baseUrl = "";

            // Generate a random path segment
            string randomPath = GenerateRandomString(8);

            // Generate random query parameters
            string randomParamKey = GenerateRandomString(5);
            string randomParamValue = GenerateRandomString(10);

            // Combine to form a URL
            string randomUrl = $"{baseUrl}{randomPath}{randomParamKey}{randomParamValue}";

            return randomUrl;
        }

        private string GenerateRandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            Random random = new Random();
            char[] stringChars = new char[length];

            for (int i = 0; i < length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            return new string(stringChars);
        }
    }
}
