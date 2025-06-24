using api.Dtos.PromptRequest;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;

[Route("api/gemini")]
[ApiController]
public class GeminiController : ControllerBase
{
    private readonly IGeminiService _geminiService;

    public GeminiController(IGeminiService geminiService)
    {
        _geminiService = geminiService;
    }


    [HttpPost("options")]
    public async Task<IActionResult> Create([FromBody] PromptRequest promptRequest)
    {
        try
        {
            string result = await _geminiService.GenerateAnswerAsync(promptRequest);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Gemini processing error: {ex.Message}");
        }
    }
}
