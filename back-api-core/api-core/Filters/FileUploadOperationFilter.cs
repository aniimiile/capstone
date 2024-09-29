using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace api_core.Filters
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Verificar si el método tiene parámetros de tipo IFormFile
            var formFileParameters = context.MethodInfo
                .GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile))
                .ToList();

            if (formFileParameters.Count > 0)
            {
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content =
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = formFileParameters.ToDictionary(f => f.Name, f => new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "binary"
                                })
                            }
                        }
                    }
                };

                // Agregar otros parámetros que no sean IFormFile
                foreach (var parameter in context.ApiDescription.ParameterDescriptions
                         .Where(p => p.ModelMetadata.ContainerType != typeof(IFormFile)))
                {
                    operation.RequestBody.Content["multipart/form-data"].Schema.Properties.Add(parameter.Name, new OpenApiSchema
                    {
                        Type = "string"
                    });
                }
            }
        }
    }
}
