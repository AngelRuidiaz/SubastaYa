using System.Text.Json;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Servicios;


public class AuditoriaServicio
{
    private readonly AplicacionDbContext _contexto;
    private readonly IServiceScopeFactory _fabricaDeScopes;

    public AuditoriaServicio(AplicacionDbContext contexto, IServiceScopeFactory fabricaDeScopes)
    {
        _contexto = contexto;
        _fabricaDeScopes = fabricaDeScopes;
    }


    public void Registrar(string entidad, int entidadId, string accion, int? usuarioId, object detalle)
    {
        _contexto.Auditoria.Add(Construir(entidad, entidadId, accion, usuarioId, detalle));
    }


    public async Task RegistrarAparteAsync(string entidad, int entidadId, string accion, int? usuarioId, object detalle)
    {
        using var scope = _fabricaDeScopes.CreateScope();
        var contextoNuevo = scope.ServiceProvider.GetRequiredService<AplicacionDbContext>();

        contextoNuevo.Auditoria.Add(Construir(entidad, entidadId, accion, usuarioId, detalle));
        await contextoNuevo.SaveChangesAsync();
    }

    private static AuditoriaLog Construir(string entidad, int entidadId, string accion, int? usuarioId, object detalle) => new()
    {
        Entidad = entidad,
        EntidadId = entidadId,
        Accion = accion,
        UsuarioId = usuarioId,
        DetalleJson = JsonSerializer.Serialize(detalle),
        Fecha = DateTime.UtcNow
    };
}
