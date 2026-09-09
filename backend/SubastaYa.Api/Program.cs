
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Hubs;
using SubastaYa.Api.Servicios;


var constructor = WebApplication.CreateBuilder(args);

// ---------------- BASE DE DATOS ----------------
constructor.Services.AddDbContext<AplicacionDbContext>(opciones =>
    opciones.UseNpgsql(constructor.Configuration.GetConnectionString("BaseDatos")));


// ---------------- SERVICIOS DE NEGOCIO ----------------
constructor.Services.AddScoped<SubastaServicio>();
constructor.Services.AddScoped<PujaServicio>();
constructor.Services.AddScoped<BilleteraServicio>();
constructor.Services.AddScoped<AuditoriaServicio>();
constructor.Services.AddHostedService<TrabajadorCierreSubastas>();

// ---------------- SIGNALR (sala de subasta en vivo) ----------------
constructor.Services.AddSignalR();

// ---------------- CORS (para que el frontend en otro puerto pueda consumir la API) ----------------
const string PoliticaFrontend = "PoliticaFrontend";

var origenesPermitidos = constructor.Configuration.GetSection("OrigenesPermitidosCors").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

constructor.Services.AddCors(opciones =>
    opciones.AddPolicy(PoliticaFrontend, politica =>
        politica.WithOrigins(origenesPermitidos)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()));   // SignalR necesita credenciales habilitadas para negociar la conexion


// ---------------- CONTROLADORES Y SWAGGER ----------------
constructor.Services.AddControllers()
    .AddJsonOptions(opciones =>
        opciones.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

constructor.Services.AddEndpointsApiExplorer();
constructor.Services.AddSwaggerGen();

var aplicacion = constructor.Build();

// ---------------- MIGRACIONES Y DATOS DE PRUEBA AL ARRANCAR ----------------
using (var alcance = aplicacion.Services.CreateScope())
{
    var contexto = alcance.ServiceProvider.GetRequiredService<AplicacionDbContext>();
    await contexto.Database.MigrateAsync();      // crea o actualiza las tablas
    await DatosSemilla.CargarAsync(contexto);    // carga los datos si la base esta vacia
}


// ---------------- MANEJO GLOBAL DE EXCEPCIONES ----------------
// Traduce las excepciones de negocio (Servicios/ExcepcionesNegocio.cs) al codigo HTTP
// que documentan los controladores, con un cuerpo JSON parejo para que el frontend
// pueda mostrar el mensaje sin tener que interpretar un stack trace.
aplicacion.Use(async (contexto, siguiente) =>
{
    try
    {
        await siguiente();
    }
    catch (Exception ex)
    {
        var (codigoHttp, codigoError) = ex switch
        {
            NoEncontradoException            => (StatusCodes.Status404NotFound, "NoEncontrado"),
            SaldoInsuficienteException       => (StatusCodes.Status422UnprocessableEntity, "SaldoInsuficiente"),
            ConflictoConcurrenciaException   => (StatusCodes.Status409Conflict, "ConflictoConcurrencia"),
            SubastaNoActivaException         => (StatusCodes.Status400BadRequest, "SubastaNoActiva"),
            MontoInvalidoException           => (StatusCodes.Status400BadRequest, "MontoInvalido"),
            ArgumentException                => (StatusCodes.Status400BadRequest, "SolicitudInvalida"),
            _                                 => (StatusCodes.Status500InternalServerError, "ErrorInterno")
        };

        if (codigoHttp == StatusCodes.Status500InternalServerError)
        {
            var registrador = contexto.RequestServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger("ManejadorGlobalDeExcepciones");
            registrador.LogError(ex, "Error no controlado en {Ruta}", contexto.Request.Path);
        }

        contexto.Response.ContentType = "application/json";
        contexto.Response.StatusCode = codigoHttp;
        await contexto.Response.WriteAsJsonAsync(new { mensaje = ex.Message, codigo = codigoError });
    }
});

if (aplicacion.Environment.IsDevelopment())
{
    aplicacion.UseSwagger();
    aplicacion.UseSwaggerUI();
}

aplicacion.UseCors(PoliticaFrontend);

aplicacion.MapControllers();
aplicacion.MapHub<SubastaHub>("/hubs/subastas");

await aplicacion.RunAsync();
