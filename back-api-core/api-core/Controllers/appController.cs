using Microsoft.AspNetCore.Mvc;
using api_core.Security;
using static api_core.Models.appModel;
using System;
using System.IO;
using System.Threading.Tasks;
using api_core.Services;
using System.Net.NetworkInformation;
using static api_core.Models.appModel;
using static System.Net.Mime.MediaTypeNames;
using static api_core.Models.faceValidationModel;
using System.Diagnostics.CodeAnalysis;
namespace api_core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class appController : ControllerBase
    {
        private readonly ILogger<appController> _logger;
        private readonly appService _appService;

        public appController(ILogger<appController> logger, appService appService)
        {
            _logger = logger;
            _appService = appService;
        }

        [HttpPost("login")]
        [ApiKeyAuth]
        public async Task<responseGeneric> login(requestLogin request)
        {
            _logger.LogInformation($"Q: Login: {request.email}");
            try
            {
                var response = await _appService.login(request);

                return new responseGeneric
                {
                    status = response.status,
                    message = response.message
                };

            } catch(Exception ex)
            {
                _logger.LogError($"E: {ex.Message}");
                return new responseGeneric
                {
                    status = false,
                    message = $"An error occurred: {ex.Message}"
                };
            }
        }

        [HttpPost("report")]
        [ApiKeyAuth]
        public async Task<responseGeneric> report([FromForm] requestReportFront request)
        {
            _logger.LogInformation($"Q: Info: {request}");
            try
            {
                // Obtener la ruta desde el archivo .env
                var uploadPath = Environment.GetEnvironmentVariable("PHOTO_REPORT_PATH");
                string imagePath = ""; 
                if (string.IsNullOrEmpty(uploadPath))
                {
                    _logger.LogInformation($"R: The image upload path is not configured.");
                    return new responseGeneric
                    {
                        status = false,
                        message = "The image upload path is not configured."
                    };
                }

                if (request.image != null)
                {
                    var imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.image.FileName);

                    // Crear las rutas completas para guardar las imágenes
                    imagePath = Path.Combine(uploadPath, imageFileName);

                    _logger.LogInformation($"Q: imagePath: {imagePath}");

                    using (var stream = new FileStream(imagePath, FileMode.Create))
                    {
                        await request.image.CopyToAsync(stream);
                    }
                }

                var requestDB = new requestReport
                {
                    id_neighborhood_board = request.id_neighborhood_board, 
                    rut = request.rut,
                    title = request.title, 
                    description = request.description, 
                    image_path = imagePath
                };

                var result = await _appService.report(requestDB);

                return new responseGeneric
                {
                    status = result.status,
                    message = result.message
                };
            }
            catch (Exception ex) 
            {
                _logger.LogError($"E: {ex.Message}");
                return new responseGeneric
                {
                    status = false,
                    message = $"An error occurred: {ex.Message}"
                };
            }
           
        }
    }
}
