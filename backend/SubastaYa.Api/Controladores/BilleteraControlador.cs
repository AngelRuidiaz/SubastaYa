using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Servicios;

namespace SubastaYa.Api.Controladores;


[Route("api/billeteras")]
public class BilleteraControlador : ControladorBase
{
    private readonly BilleteraServicio _billetera;

    public BilleteraControlador(BilleteraServicio billetera) => _billetera = billetera;

   
    [HttpGet("{usuarioId:int}")]
    [ProducesResponseType(typeof(BalanceBilleteraDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ObtenerBalance(int usuarioId) =>
        Ok(await _billetera.ObtenerBalanceAsync(usuarioId));

   
    [HttpGet("{usuarioId:int}/movimientos")]
    [ProducesResponseType(typeof(List<MovimientoDto>), 200)]
    public async Task<IActionResult> ObtenerMovimientos(int usuarioId) =>
        Ok(await _billetera.ObtenerMovimientosAsync(usuarioId));

    
   
    
    [HttpPost("{usuarioId:int}/depositos")]
    [ProducesResponseType(typeof(BalanceBilleteraDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CargarSaldo(int usuarioId, [FromBody] CargaSaldoDto datos)
    {
        var balance = await _billetera.CargarSaldoAsync(usuarioId, datos.Monto);
        return StatusCode(201, balance);
    }
}
