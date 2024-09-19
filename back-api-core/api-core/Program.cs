using api_core.Services;
using DotNetEnv;
using Microsoft.OpenApi.Models;
using static api_core.Security.ApiKeyAuthAttribute;
using NLog;
using NLog.Web;

var logger = NLog.LogManager.Setup().LoadConfigurationFromFile("nlog.config").GetCurrentClassLogger();

var builder = WebApplication.CreateBuilder(args);

// Cargar las variables del archivo .env
Env.Load();

// Obtener la clave API desde el archivo .env
var apiKey = Environment.GetEnvironmentVariable("API_KEY");

// Add services to the container.

builder.Logging.ClearProviders();  // Eliminar otros proveedores de logging
builder.Host.UseNLog();

builder.Services.AddControllers();
builder.Services.AddHttpClient<faceValidationService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme()
    {
        In = ParameterLocation.Header,
        Description = "ApiKey authorization",
        Name = "ApiKey",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Basic"
    });

    c.OperationFilter<AuthResponsesOperationFilter>();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
