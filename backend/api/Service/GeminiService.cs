using api.Dtos.PromptRequest;
using api.Interfaces;
using System.Text.Json;
using System.Text;
using System.Text.RegularExpressions;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public GeminiService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<string> GenerateAnswerAsync(PromptRequest request)
    {

        string promptPath = request.Type switch
        {
            "radiobox" => "Resources/GeminiPrompts/RadioQuestion.txt",
            "checkbox" => "Resources/GeminiPrompts/CheckboxQuestion.txt",
            _ => "Resources/GeminiPrompts/TextboxQuestion.txt"
        };

        string promptContext = await System.IO.File.ReadAllTextAsync(promptPath);
        string promptText = promptContext + request.Question;

        var partsList = new List<object>();

        if (!string.IsNullOrEmpty(request.ImageUrl))
        {
            byte[] imageBytes = await _httpClient.GetByteArrayAsync(request.ImageUrl);
            string base64String = Convert.ToBase64String(imageBytes);

            partsList.Add(new
            {
                inline_data = new
                {
                    mime_type = "image/png",
                    data = base64String
                }
            });
        }

        partsList.Add(new { text = promptText });

        var geminiPayload = new
        {
            contents = new[]
            {
                new { parts = partsList.ToArray() }
            }
        };

        var requestContent = new StringContent(JsonSerializer.Serialize(geminiPayload), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"{_config["Gemini:EndpointUrl"]}?key={_config["Gemini:Apikey"]}",
            requestContent
        );

        var responseString = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(responseString))
            throw new Exception("Gemini API returned an error or empty response.");

        var responseJson = JsonDocument.Parse(responseString);

        string rawText = responseJson
            .RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        // Clean Markdown formatting
        string cleanedText = rawText
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        // Extract JSON array using regex
        var match = Regex.Match(cleanedText, @"\[\s*{.*?}\s*\]", RegexOptions.Singleline);

        if (!match.Success)
            throw new Exception("Could not find JSON array in Gemini response.");

        // Optional: Clean up newlines and whitespace
        string jsonResult = match.Value
            .Replace("\n", "")
            .Replace("\r", "")
            .Trim();

        return jsonResult;
    }
}
