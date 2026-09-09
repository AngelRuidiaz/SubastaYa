using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Controladores;


[Route("api/usuarios")]
public class ActividadesControlador : ControladorBase
{
    private readonly AplicacionDbContext _contexto;

    public ActividadesControlador(AplicacionDbContext contexto) => _contexto = contexto;

    
    [HttpGet]
    [ProducesResponseType(typeof(List<UsuarioDto>), 200)]
    public async Task<IActionResult> ObtenerUsuarios() =>
        Ok(await _contexto.Usuarios
            .OrderBy(u => u.Id)
            .Select(u => new UsuarioDto { Id = u.Id, Nombre = u.Nombre, Email = u.Email })
            .ToListAsync());

    
    [HttpGet("{usuarioId:int}/pujas")]
    [ProducesResponseType(typeof(List<ParticipacionDto>), 200)]
    public async Task<IActionResult> ObtenerMisCompras(int usuarioId)
    {
        
        var subastas = await _contexto.Subastas
            .Include(s => s.Pujas)
            .Where(s => s.Pujas.Any(p => p.CompradorId == usuarioId))
            .AsNoTracking()
            .ToListAsync();

        var participaciones = subastas.Select(subasta =>
        {
            var soyLider = subasta.PujaLider()?.CompradorId == usuarioId;

            return new ParticipacionDto
            {
                SubastaId = subasta.Id,
                Titulo = subasta.Titulo,
                UrlImagen = subasta.UrlImagen,
                EstadoSubasta = subasta.Estado.ToString(),
                MiMejorPuja = subasta.Pujas.Where(p => p.CompradorId == usuarioId).Max(p => p.Monto),
                PujaMasAlta = subasta.MontoLider(),
                EstoyLiderando = soyLider && subasta.Estado == EstadoSubasta.Activa,
                Gane = soyLider && subasta.Estado == EstadoSubasta.Finalizada,
                FechaFin = subasta.FechaFin
            };
        })
        .OrderByDescending(p => p.FechaFin)
        .ToList();

        return Ok(participaciones);
    }

    
    [HttpGet("{usuarioId:int}/subastas")]
    [ProducesResponseType(typeof(List<PublicacionDto>), 200)]
    public async Task<IActionResult> ObtenerMisPublicaciones(int usuarioId)
    {
        var subastas = await _contexto.Subastas
            .Include(s => s.Pujas)
            .Where(s => s.VendedorId == usuarioId)
            .OrderByDescending(s => s.FechaInicio)
            .AsNoTracking()
            .ToListAsync();

        var publicaciones = subastas.Select(subasta => new PublicacionDto
        {
            Id = subasta.Id,
            Titulo = subasta.Titulo,
            UrlImagen = subasta.UrlImagen,
            Estado = subasta.Estado.ToString(),
            CantidadPujas = subasta.Pujas.Count,
            MejorOferta = subasta.MontoLider(),

            
            Recaudado = subasta.Estado == EstadoSubasta.Finalizada ? subasta.MontoLider() : 0m,
            FechaFin = subasta.FechaFin
        })
        .ToList();

        return Ok(publicaciones);
    }
}
