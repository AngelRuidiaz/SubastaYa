using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Hubs;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Servicios;


public class TrabajadorCierreSubastas : BackgroundService
{
    private static readonly TimeSpan Intervalo = TimeSpan.FromSeconds(10);

    private readonly IServiceScopeFactory _fabricaDeScopes;
    private readonly ILogger<TrabajadorCierreSubastas> _registrador;

    public TrabajadorCierreSubastas(IServiceScopeFactory fabricaDeScopes,
                                    ILogger<TrabajadorCierreSubastas> registrador)
    {
        _fabricaDeScopes = fabricaDeScopes;
        _registrador = registrador;
    }

    protected override async Task ExecuteAsync(CancellationToken cancelacion)
    {
        _registrador.LogInformation("Worker de cierre iniciado. Revisa cada {Segundos} segundos.",
            Intervalo.TotalSeconds);

        while (!cancelacion.IsCancellationRequested)
        {
            try
            {
               
                using var scope = _fabricaDeScopes.CreateScope();
                var contexto = scope.ServiceProvider.GetRequiredService<AplicacionDbContext>();
                var auditoria = scope.ServiceProvider.GetRequiredService<AuditoriaServicio>();
                var hub = scope.ServiceProvider.GetRequiredService<IHubContext<SubastaHub>>();

                await ActivarProgramadasAsync(contexto, auditoria);
                await CerrarVencidasAsync(contexto, auditoria, hub);
            }
            catch (Exception ex)
            {
                
                _registrador.LogError(ex, "Error en el ciclo del worker de cierre.");
            }

            await Task.Delay(Intervalo, cancelacion);
        }
    }

    
    private async Task ActivarProgramadasAsync(AplicacionDbContext contexto, AuditoriaServicio auditoria)
    {
        var ahora = DateTime.UtcNow;

        var programadas = await contexto.Subastas
            .Where(s => s.Estado == EstadoSubasta.Programada && s.FechaInicio <= ahora)
            .ToListAsync();

        if (programadas.Count == 0) return;

        foreach (var subasta in programadas)
        {
            subasta.CambiarEstado(EstadoSubasta.Activa);

            
            auditoria.Registrar(Entidades.Subasta, subasta.Id, Acciones.SubastaActivada,
                null, new { fechaInicio = subasta.FechaInicio });
        }

        await contexto.SaveChangesAsync();
        _registrador.LogInformation("Worker: {Cantidad} subastas activadas.", programadas.Count);
    }

    
    private async Task CerrarVencidasAsync(AplicacionDbContext contexto, AuditoriaServicio auditoria,
                                           IHubContext<SubastaHub> hub)
    {
        var ahora = DateTime.UtcNow;

        var vencidas = await contexto.Subastas
            .Include(s => s.Pujas)
            .Where(s => s.Estado == EstadoSubasta.Activa && s.FechaFin <= ahora)
            .ToListAsync();

        foreach (var subasta in vencidas)
        {
            var ganadora = subasta.PujaLider();

            
            await using var transaccion = await contexto.Database.BeginTransactionAsync();
            try
            {
                if (ganadora is null)
                {
                    subasta.CambiarEstado(EstadoSubasta.Desierta);

                    auditoria.Registrar(Entidades.Subasta, subasta.Id, Acciones.SubastaDesierta,
                        null, new { motivo = "Vencio sin recibir ninguna oferta" });
                }
                else
                {
                    await LiquidarAsync(contexto, auditoria, subasta, ganadora, ahora);
                }

                await contexto.SaveChangesAsync();
                await transaccion.CommitAsync();

                await hub.Clients.Group(SubastaHub.NombreGrupo(subasta.Id))
                    .SendAsync("SubastaCerrada", new
                    {
                        subastaId = subasta.Id,
                        estadoFinal = subasta.Estado.ToString(),
                        ganadorId = ganadora?.CompradorId,
                        montoFinal = ganadora?.Monto ?? 0m
                    });

                _registrador.LogInformation("Worker: subasta {Id} cerrada como {Estado}.",
                    subasta.Id, subasta.Estado);
            }
            catch (Exception ex)
            {
                await transaccion.RollbackAsync();
                
                _registrador.LogError(ex, "No se pudo cerrar la subasta {Id}.", subasta.Id);
            }
        }
    }

    
    private static async Task LiquidarAsync(AplicacionDbContext contexto, AuditoriaServicio auditoria,
                                            Subasta subasta, Puja ganadora, DateTime ahora)
    {
        var billeteraComprador = await contexto.Billeteras
            .FirstOrDefaultAsync(b => b.UsuarioId == ganadora.CompradorId)
            ?? throw new InvalidOperationException("El ganador no tiene billetera.");

        var billeteraVendedor = await contexto.Billeteras
            .FirstOrDefaultAsync(b => b.UsuarioId == subasta.VendedorId)
            ?? throw new InvalidOperationException("El vendedor no tiene billetera.");

        
        billeteraComprador.PagarDesdeRetencion(ganadora.Monto);
        billeteraVendedor.Acreditar(ganadora.Monto);

        contexto.Transacciones.AddRange(
            new TransaccionLedger
            {
                BilleteraId = billeteraComprador.Id,
                Tipo = TipoTransaccion.Pago,
                Monto = ganadora.Monto,
                Fecha = ahora,
                SubastaId = subasta.Id
            },
            new TransaccionLedger
            {
                BilleteraId = billeteraVendedor.Id,
                Tipo = TipoTransaccion.Cobro,
                Monto = ganadora.Monto,
                Fecha = ahora,
                SubastaId = subasta.Id
            });

        subasta.CambiarEstado(EstadoSubasta.Finalizada);

        auditoria.Registrar(Entidades.Subasta, subasta.Id, Acciones.CierreWorker, null,
            new
            {
                ganadorId = ganadora.CompradorId,
                vendedorId = subasta.VendedorId,
                montoFinal = ganadora.Monto
            });
    }
}
