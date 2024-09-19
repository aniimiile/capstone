using System.Net.Http.Headers;
using System.Text.Json;
using api_core.Models;
using static api_core.Models.faceValidationModel;

namespace api_core.Services
{
    public class faceValidationService
    {
        private readonly string _url_face_validation;
        private readonly HttpClient _httpClient;
        private readonly ILogger<faceValidationService> _logger;

        public faceValidationService(HttpClient httpClient, ILogger<faceValidationService> logger)
        {
            _url_face_validation = Environment.GetEnvironmentVariable("URL_FACE_VALIDATION");
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<responseFaceValidation> comparation_idcard_face(requestFaceValidation request)
        {
            try
            {
                _logger.LogInformation($"Q: {request}");
                // Serializar el objeto request a JSON
                var jsonRequest = JsonSerializer.Serialize(request);
                var content = new StringContent(jsonRequest, System.Text.Encoding.UTF8, "application/json");

                // Realizar la solicitud POST
                var response = await _httpClient.PostAsync(_url_face_validation, content);

                // Verificar si la solicitud fue exitosa
                if (!response.IsSuccessStatusCode)
                {
                    return new responseFaceValidation
                    {
                        status = false, 
                        message = "response was not successful"
                    };
                }

                // Leer la respuesta y deserializar si es necesario
                var respContent = await response.Content.ReadAsStringAsync();
                var respObj = JsonSerializer.Deserialize<responseFaceValidation>(respContent);
                _logger.LogInformation($"R: status: {respObj.status}, message: {respObj.message}");

                // Verifica el estado en el objeto de respuesta
                return new responseFaceValidation
                {
                    status = respObj.status,
                    message = respObj.message
                };

            }
            catch (Exception ex)
            {
                _logger.LogError($"E: Q--> {request} E--> {ex.Message}"); 
                return new responseFaceValidation
                {
                    status = false,
                    message = $"An error occurred: {ex.Message}"
                };
            }
        }
    }
}
