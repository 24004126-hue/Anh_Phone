using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PhoneStore.API.Swagger
{
    public class SwaggerFileOperationFilter : IOperationFilter
    {
        public void Apply(
            OpenApiOperation operation,
            OperationFilterContext context)
        {
            var fileParameters = context.ApiDescription.ParameterDescriptions
                .Where(p =>
                    p.Type == typeof(IFormFile) ||
                    p.Type == typeof(IFormFileCollection))
                .ToList();

            if (!fileParameters.Any())
                return;

            operation.RequestBody = new OpenApiRequestBody
            {
                Required = true,
                Content =
                {
                    ["multipart/form-data"] =
                        new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties =
                                {
                                    ["file"] = new OpenApiSchema
                                    {
                                        Type = "string",
                                        Format = "binary"
                                    }
                                },
                                Required =
                                new HashSet<string>
                                {
                                    "file"
                                }
                            }
                        }
                }
            };
        }
    }
}