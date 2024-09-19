using Microsoft.AspNetCore.Mvc;
using api_core.Security;
using static api_core.Models.faceValidationModel;
using System;
using System.IO;
using System.Threading.Tasks;
using api_core.Services;
using System.Net.NetworkInformation;
namespace api_core.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class faceValidationController: ControllerBase
    {
        private readonly ILogger<faceValidationController> _logger;

        private readonly faceValidationService _faceValidationService;

        public faceValidationController(ILogger<faceValidationController> logger, faceValidationService faceValidationService)
        {
            _logger = logger;
            _faceValidationService = faceValidationService;
        }

        [HttpPost("")]
        [ApiKeyAuth]

        public async Task<responseFaceValidation> FaceValidation(IFormFile image1, IFormFile image2)
        {
            _logger.LogInformation($"Q: image1: {image1}, image2: {image2}");
            // Obtener la ruta desde el archivo .env
            var uploadPath = Environment.GetEnvironmentVariable("IMAGE_UPLOAD_PATH");
            if (string.IsNullOrEmpty(uploadPath))
            {
                _logger.LogInformation($"R: The image upload path is not configured.");
                return new responseFaceValidation
                {
                    status = false,
                    message = "The image upload path is not configured."
                };
            }

            // Validar que las imágenes se hayan recibido
            if (image1 == null || image2 == null)
            {
                _logger.LogInformation($"R: Both images must be provided.");
                return new responseFaceValidation
                {
                    status = false,
                    message = "Both images must be provided."
                };
            }

            // Generar nombres únicos para las imágenes
            var image1FileName = Guid.NewGuid().ToString() + Path.GetExtension(image1.FileName);
            var image2FileName = Guid.NewGuid().ToString() + Path.GetExtension(image2.FileName);

            // Crear las rutas completas para guardar las imágenes
            var image1Path = Path.Combine(uploadPath, image1FileName);
            var image2Path = Path.Combine(uploadPath, image2FileName);

            _logger.LogInformation($"Q: image1Path: {image1Path}, image2Path: {image2Path}");

            try
            {
                // Guardar la primera imagen
                using (var stream = new FileStream(image1Path, FileMode.Create))
                {
                    await image1.CopyToAsync(stream);
                }

                // Guardar la segunda imagen
                using (var stream = new FileStream(image2Path, FileMode.Create))
                {
                    await image2.CopyToAsync(stream);
                }

                // Crear el request con las rutas de las imágenes
                var request = new requestFaceValidation
                {
                    id_card_photo = image1Path,
                    face_photo = image2Path
                };

                // Llamar al servicio de validación
                var response = await _faceValidationService.comparation_idcard_face(request);

                if (System.IO.File.Exists(image1Path))
                {
                    System.IO.File.Delete(image1Path);
                }
                if (System.IO.File.Exists(image2Path))
                {
                    System.IO.File.Delete(image2Path);
                }

                _logger.LogInformation($"R: status: {response.status}, message: {response.message}");

                return new responseFaceValidation
                {
                    status = response.status,
                    message = response.message
                };

            }
            catch (Exception ex)
            {
                _logger.LogError($"E: {ex.Message}");
                return new responseFaceValidation
                {
                    status = false,
                    message = $"An error occurred: {ex.Message}"
                };
            }

        }
    }
}
