using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Servicios;


public class BilleteraServicio
{
    private readonly AplicacionDbContext _contexto;
    private readonly AuditoriaServicio _auditoria;

    public BilleteraServicio(AplicacionDbContext contexto, AuditoriaServicio auditoria)
    {
        _contexto = contexto;
        _auditoria = auditoria;
    }

    public async Task<BalanceBilleteraDto> ObtenerBalanceAsync(int usuarioId)
    {
        var billetera = await BuscarBilleteraAsync(usuarioId);

        return new BalanceBilleteraDto
        {
            SaldoTotal = billetera.SaldoTotal,
            SaldoRetenido = billetera.SaldoRetenido,
            SaldoDisponible = billetera.SaldoDisponible
        };
    }

    public async Task<List<MovimientoDto>> ObtenerMovimientosAsync(int usuarioId)
    {
        var billetera = await BuscarBilleteraAsync(usuarioId);

        return await _contexto.Transacciones
            .Where(t => t.BilleteraId == billetera.Id)
            .OrderByDescending(t => t.Fecha)
            .Select(t => new MovimientoDto
            {
                Id = t.Id,
                Tipo = t.Tipo.ToString(),
                Monto = t.Monto,
                Fecha = t.Fecha,
                SubastaId = t.SubastaId
            })
            .ToListAsync();
    }

 
    public async Task<BalanceBilleteraDto> CargarSaldoAsync(int usuarioId, decimal monto)
    {
        if (monto <= 0)
            throw new ArgumentException("El monto a cargar debe ser mayor a cero.");

        var billetera = await BuscarBilleteraAsync(usuarioId);


        await using var transaccion = await _contexto.Database.BeginTransactionAsync();
        try
        {
            billetera.Acreditar(monto);

            _contexto.Transacciones.Add(new TransaccionLedger
            {
                BilleteraId = billetera.Id,
                Tipo = TipoTransaccion.Deposito,
                Monto = monto,
                Fecha = DateTime.UtcNow
            });

            _auditoria.Registrar(Entidades.Billetera, billetera.Id, Acciones.AcreditacionSaldo,
                usuarioId, new { monto, saldoResultante = billetera.SaldoTotal });

            await _contexto.SaveChangesAsync();
            await transaccion.CommitAsync();
        }
        catch
        {
            await transaccion.RollbackAsync();
            throw;
        }

        return new BalanceBilleteraDto
        {
            SaldoTotal = billetera.SaldoTotal,
            SaldoRetenido = billetera.SaldoRetenido,
            SaldoDisponible = billetera.SaldoDisponible
        };
    }

    private async Task<Billetera> BuscarBilleteraAsync(int usuarioId) =>
        await _contexto.Billeteras.FirstOrDefaultAsync(b => b.UsuarioId == usuarioId)
        ?? throw new NoEncontradoException($"El usuario {usuarioId} no tiene billetera.");
}
