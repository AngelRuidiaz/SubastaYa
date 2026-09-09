using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Servicios;

namespace SubastaYa.Api.Controladores;


[Route("api/subastas")]
public class SubastasControlador : ControladorBase
{
    private readonly SubastaServicio _subastas;

    public SubastasControlador(SubastaServicio subastas) => _subastas = subastas;

    
    [HttpGet]
    [ProducesResponseType(typeof(PaginaDto<RespuestaSubastaDto>), 200)]
    public async Task<IActionResult> Buscar(
        [FromQuery] string? estado,
        [FromQuery] int? categoriaId,
        [FromQuery] decimal? precioMinimo,
        [FromQuery] decimal? precioMaximo,
        [FromQuery] string? orden,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanioPagina = 12)
    {
        var resultado = await _subastas.BuscarAsync(
            estado, categoriaId, precioMinimo, precioMaximo, orden, pagina, tamanioPagina);

        return Ok(resultado);
    }

    
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DetalleSubastaDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ObtenerDetalle(int id) =>
        Ok(await _subastas.ObtenerDetalleAsync(id));

    
    [HttpPost]
    [ProducesResponseType(typeof(DetalleSubastaDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Crear([FromBody] CreacionSubastaDto datos)
    {
        
        var creada = await _subastas.CrearAsync(UsuarioActualId, datos);
        return CreatedAtAction(nameof(ObtenerDetalle), new { id = creada.Id }, creada);
    }

    
    
    
    [HttpGet("~/api/categorias")]
    [ProducesResponseType(typeof(List<CategoriaDto>), 200)]
    public async Task<IActionResult> ObtenerCategorias() =>
        Ok(await _subastas.ObtenerCategoriasAsync());
}
