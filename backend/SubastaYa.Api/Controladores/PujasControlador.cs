using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Servicios;

namespace SubastaYa.Api.Controladores;




[Route("api/subastas/{subastaId:int}/pujas")]
public class PujasControlador : ControladorBase
{
    private readonly PujaServicio _pujas;

    public PujasControlador(PujaServicio pujas) => _pujas = pujas;

    
    [HttpGet]
    [ProducesResponseType(typeof(List<RespuestaPujaDto>), 200)]
    public async Task<IActionResult> ObtenerHistorial(int subastaId) =>
        Ok(await _pujas.ObtenerHistorialAsync(subastaId));

    
    
    
    [HttpPost]
    [ProducesResponseType(typeof(ResultadoPujaDto), 201)]
    [ProducesResponseType(400)]   // monto insuficiente o subasta no activa
    [ProducesResponseType(404)]   // no existe la subasta
    [ProducesResponseType(409)]   // dos pujas simultaneas: esta perdio
    [ProducesResponseType(422)]   // saldo disponible insuficiente
    public async Task<IActionResult> Pujar(int subastaId, [FromBody] CreacionPujaDto datos)
    {
        var resultado = await _pujas.RegistrarPujaAsync(subastaId, UsuarioActualId, datos.Monto);
        return StatusCode(201, resultado);
    }
}
