using api_core.Services;
using DotNetEnv;
using Microsoft.OpenApi.Models;
using static api_core.Security.ApiKeyAuthAttribute;
using NLog;
using NLog.Web;
using Npgsql;
using System.Data;
using Microsoft.AspNetCore.Http.Features;

var logger = NLog.LogManager.Setup().LoadConfigurationFromFile("nlog.config").GetCurrentClassLogger();

var builder = WebApplication.CreateBuilder(args);

// Cargar las variables del archivo .env
Env.Load();

// Obtener la clave API desde el archivo .env
var apiKey = Environment.GetEnvironmentVariable("API_KEY");

// Add services to the container.

builder.Logging.ClearProviders();  // Eliminar otros proveedores de logging
builder.Host.UseNLog();

builder.Services.AddScoped<IDbConnection>(sp =>
    new NpgsqlConnection(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")));


builder.Services.AddControllers();
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB para archivos
});

builder.Services.AddHttpClient<faceValidationService>();
builder.Services.AddScoped<appService>();


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
