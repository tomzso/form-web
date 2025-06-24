using api.Dtos.PromptRequest;

namespace api.Interfaces
{
    public interface IGeminiService
    {
        Task<string> GenerateAnswerAsync(PromptRequest request);
    }
}
