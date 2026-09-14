using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Servicios;


public class SubastaServicio
{
    private readonly AplicacionDbContext _contexto;

    public SubastaServicio(AplicacionDbContext contexto) => _contexto = contexto;

    
    public async Task<PaginaDto<RespuestaSubastaDto>> BuscarAsync(
        string? estado, int? categoriaId, decimal? precioMinimo, decimal? precioMaximo,
        string? orden, int pagina, int tamanioPagina)
    {
        
        if (pagina < 1) pagina = 1;
        if (tamanioPagina < 1) tamanioPagina = 12;
        if (tamanioPagina > 50) tamanioPagina = 50;

        var consulta = _contexto.Subastas
            .Include(s => s.Categoria)
            .Include(s => s.Pujas)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estado) &&
            Enum.TryParse<EstadoSubasta>(estado, ignoreCase: true, out var estadoFiltro))
        {
            consulta = consulta.Where(s => s.Estado == estadoFiltro);
        }

        if (categoriaId.HasValue)
            consulta = consulta.Where(s => s.CategoriaId == categoriaId.Value);

        
        if (precioMinimo.HasValue)
            consulta = consulta.Where(s =>
                (s.Pujas.Any() ? s.Pujas.Max(p => p.Monto) : s.PrecioBase) >= precioMinimo.Value);

        if (precioMaximo.HasValue)
            consulta = consulta.Where(s =>
                (s.Pujas.Any() ? s.Pujas.Max(p => p.Monto) : s.PrecioBase) <= precioMaximo.Value);

        consulta = orden?.ToLower() switch
        {
            "mayorpuja"    => consulta.OrderByDescending(s => s.Pujas.Any() ? s.Pujas.Max(p => p.Monto) : s.PrecioBase),
            "masrecientes" => consulta.OrderByDescending(s => s.FechaInicio),
            _              => consulta.OrderBy(s => s.FechaFin)   
        };

        
        var total = await consulta.CountAsync();

        var subastas = await consulta
            .Skip((pagina - 1) * tamanioPagina)
            .Take(tamanioPagina)
            .ToListAsync();

        var ahora = DateTime.UtcNow;

        return new PaginaDto<RespuestaSubastaDto>
        {
            Elementos = subastas.Select(s => AResumen(s, ahora)).ToList(),
            TotalElementos = total,
            Pagina = pagina,
            TamanioPagina = tamanioPagina
        };
    }

    public async Task<DetalleSubastaDto> ObtenerDetalleAsync(int subastaId)
    {
        var subasta = await _contexto.Subastas
            .Include(s => s.Categoria)
            .Include(s => s.Vendedor)
            .Include(s => s.Pujas)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == subastaId)
            ?? throw new NoEncontradoException($"No existe la subasta {subastaId}.");

        return ADetalle(subasta, DateTime.UtcNow);
    }

    public async Task<DetalleSubastaDto> CrearAsync(int vendedorId, CreacionSubastaDto datos)
    {
        
        if (string.IsNullOrWhiteSpace(datos.Titulo))
            throw new ArgumentException("El titulo es obligatorio.");

        if (datos.PrecioBase <= 0)
            throw new ArgumentException("El precio base debe ser mayor a cero.");

        if (datos.IncrementoMinimo <= 0)
            throw new ArgumentException("El incremento minimo debe ser mayor a cero.");

        if (datos.FechaFin <= datos.FechaInicio)
            throw new ArgumentException("La fecha de fin debe ser posterior a la de inicio.");

        if (!await _contexto.Usuarios.AnyAsync(u => u.Id == vendedorId))
            throw new NoEncontradoException($"No existe el usuario {vendedorId}.");

        if (!await _contexto.Categorias.AnyAsync(c => c.Id == datos.CategoriaId))
            throw new NoEncontradoException($"No existe la categoria {datos.CategoriaId}.");

        var inicioUtc = datos.FechaInicio.ToUniversalTime();
        var finUtc = datos.FechaFin.ToUniversalTime();

        var subasta = new Subasta
        {
            VendedorId = vendedorId,
            CategoriaId = datos.CategoriaId,
            Titulo = datos.Titulo.Trim(),
            Descripcion = datos.Descripcion.Trim(),
            UrlImagen = datos.UrlImagen.Trim(),
            PrecioBase = datos.PrecioBase,
            IncrementoMinimo = datos.IncrementoMinimo,
            FechaInicio = inicioUtc,
            FechaFin = finUtc,

            
            Estado = inicioUtc <= DateTime.UtcNow ? EstadoSubasta.Activa : EstadoSubasta.Programada
        };

        _contexto.Subastas.Add(subasta);
        await _contexto.SaveChangesAsync();

        return await ObtenerDetalleAsync(subasta.Id);
    }

    public async Task<List<CategoriaDto>> ObtenerCategoriasAsync() =>
        await _contexto.Categorias
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoriaDto { Id = c.Id, Nombre = c.Nombre, UrlIcono = c.UrlIcono })
            .ToListAsync();

    

    public static RespuestaSubastaDto AResumen(Subasta s, DateTime ahora) => new()
    {
        Id = s.Id,
        Titulo = s.Titulo,
        UrlImagen = s.UrlImagen,
        Categoria = s.Categoria?.Nombre ?? string.Empty,
        PujaMasAlta = s.MontoLider(),
        CantidadPujas = s.Pujas.Count,
        FechaFin = s.FechaFin,
        Estado = s.Estado.ToString(),
        SegundosRestantes = Math.Max(0, (s.FechaFin - ahora).TotalSeconds)
    };

    public static DetalleSubastaDto ADetalle(Subasta s, DateTime ahora) => new()
    {
        Id = s.Id,
        Titulo = s.Titulo,
        UrlImagen = s.UrlImagen,
        Categoria = s.Categoria?.Nombre ?? string.Empty,
        PujaMasAlta = s.MontoLider(),
        CantidadPujas = s.Pujas.Count,
        FechaFin = s.FechaFin,
        Estado = s.Estado.ToString(),
        SegundosRestantes = Math.Max(0, (s.FechaFin - ahora).TotalSeconds),

        Descripcion = s.Descripcion,
        Vendedor = s.Vendedor?.Nombre ?? string.Empty,
        VendedorId = s.VendedorId,
        PrecioBase = s.PrecioBase,
        IncrementoMinimo = s.IncrementoMinimo,
        FechaInicio = s.FechaInicio,
        MontoMinimoParaPujar = s.MontoMinimoParaPujar(),
        LiderActualId = s.PujaLider()?.CompradorId,

        Pujas = s.Pujas
            .OrderByDescending(p => p.FechaPuja)
            .Select(PujaServicio.APujaDto)
            .ToList()
    };
}
