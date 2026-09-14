using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Datos;
using SubastaYa.Api.Dtos;
using SubastaYa.Api.Hubs;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Servicios;


public class PujaServicio
{
    private readonly AplicacionDbContext _contexto;
    private readonly AuditoriaServicio _auditoria;
    private readonly IHubContext<SubastaHub> _hub;


    public PujaServicio(AplicacionDbContext contexto, AuditoriaServicio auditoria, IHubContext<SubastaHub> hub)
    {
        _contexto = contexto;
        _auditoria = auditoria;
        _hub = hub;
    }

    public async Task<ResultadoPujaDto> RegistrarPujaAsync(int subastaId, int compradorId, decimal monto)
    {
        var ahora = DateTime.UtcNow;

        await using var transaccion = await _contexto.Database.BeginTransactionAsync();
        try
        {
            // ---------- traer la subasta y validar su estado ----------
            var subasta = await _contexto.Subastas
                .Include(s => s.Pujas)
                .FirstOrDefaultAsync(s => s.Id == subastaId)
                ?? throw new NoEncontradoException($"No existe la subasta {subastaId}.");

            if (subasta.Estado != EstadoSubasta.Activa)
                throw new SubastaNoActivaException(subastaId, subasta.Estado.ToString());


            if (subasta.EstaVencida(ahora))
                throw new SubastaNoActivaException(subastaId, "VENCIDA");

            if (subasta.VendedorId == compradorId)
                throw new ArgumentException("El vendedor no puede pujar en su propia subasta.");

            // ----------  validar el monto ----------
            var montoMinimo = subasta.MontoMinimoParaPujar();
            if (monto < montoMinimo)
                throw new MontoInvalidoException(monto, montoMinimo);

            var billeteraComprador = await _contexto.Billeteras
                .FirstOrDefaultAsync(b => b.UsuarioId == compradorId)
                ?? throw new NoEncontradoException($"El usuario {compradorId} no tiene billetera.");


            var liderAnterior = subasta.PujaLider();

            if (liderAnterior is not null)
            {
                var billeteraLider = await _contexto.Billeteras
                    .FirstOrDefaultAsync(b => b.UsuarioId == liderAnterior.CompradorId)
                    ?? throw new NoEncontradoException("El lider anterior no tiene billetera.");

                billeteraLider.Liberar(liderAnterior.Monto);

                _contexto.Transacciones.Add(new TransaccionLedger
                {
                    BilleteraId = billeteraLider.Id,
                    Tipo = TipoTransaccion.Liberacion,
                    Monto = liderAnterior.Monto,
                    Fecha = ahora,
                    SubastaId = subastaId
                });
            }


            billeteraComprador.Retener(monto);

            _contexto.Transacciones.Add(new TransaccionLedger
            {
                BilleteraId = billeteraComprador.Id,
                Tipo = TipoTransaccion.Retencion,
                Monto = monto,
                Fecha = ahora,
                SubastaId = subastaId
            });

            // ---------- registrar la oferta ----------
            var puja = new Puja
            {
                SubastaId = subastaId,
                CompradorId = compradorId,
                Monto = monto,
                FechaPuja = ahora
            };
            _contexto.Pujas.Add(puja);


            subasta.RegistrarActividadDePuja();

            // ---------- regla anti-sniping ----------
            var huboExtension = subasta.EstaEnZonaAntiSniping(ahora);
            if (huboExtension)
            {
                subasta.ExtenderPorAntiSniping();


                _auditoria.Registrar(Entidades.Subasta, subastaId, Acciones.ExtensionTiempo, compradorId,
                    new
                    {
                        motivo = "Oferta recibida dentro de los ultimos 60 segundos",
                        minutosAgregados = Subasta.MinutosDeExtension,
                        nuevaFechaFin = subasta.FechaFin
                    });
            }


            await GuardarDetectandoConflictosAsync();
            await transaccion.CommitAsync();

            var resultado = new ResultadoPujaDto
            {
                PujaId = puja.Id,
                SubastaId = subastaId,
                Monto = monto,
                NuevaFechaFin = subasta.FechaFin,
                HuboExtensionAntiSniping = huboExtension,
                SaldoDisponibleRestante = billeteraComprador.SaldoDisponible
            };


            await NotificarSalaAsync(subasta, puja, compradorId, liderAnterior, huboExtension, monto);

            return resultado;
        }
        catch (ConflictoConcurrenciaException)
        {
            await transaccion.RollbackAsync();


            await _auditoria.RegistrarAparteAsync(Entidades.Subasta, subastaId,
                Acciones.PujaRechazadaConcurrencia, compradorId,
                new { monto, motivo = "Otra puja modifico la subasta al mismo tiempo" });

            throw;
        }
        catch (Exception ex)
        {
            await transaccion.RollbackAsync();

            await _auditoria.RegistrarAparteAsync(Entidades.Subasta, subastaId,
                Acciones.PujaRechazadaValidacion, compradorId,
                new { monto, motivo = ex.Message });

            throw;
        }
    }


    private async Task GuardarDetectandoConflictosAsync()
    {
        try
        {
            await _contexto.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictoConcurrenciaException(
                "Otra puja se registro primero sobre esta subasta. Volve a intentar.");
        }
    }

    private async Task NotificarSalaAsync(Subasta subasta, Puja puja, int compradorId,
                                          Puja? liderAnterior, bool huboExtension, decimal monto)
    {
        var grupo = _hub.Clients.Group(SubastaHub.NombreGrupo(subasta.Id));

        await grupo.SendAsync("PujaRegistrada", new
        {
            subastaId = subasta.Id,
            puja = APujaDto(puja),
            fechaFin = subasta.FechaFin
        });


        if (liderAnterior is not null && liderAnterior.CompradorId != compradorId)
        {
            await grupo.SendAsync("FuisteSuperado", new
            {
                subastaId = subasta.Id,
                usuarioSuperadoId = liderAnterior.CompradorId,
                nuevoMonto = monto
            });
        }

        if (huboExtension)
        {
            await grupo.SendAsync("TiempoExtendido", new
            {
                subastaId = subasta.Id,
                nuevaFechaFin = subasta.FechaFin
            });
        }
    }

    public async Task<List<RespuestaPujaDto>> ObtenerHistorialAsync(int subastaId) =>
        await _contexto.Pujas
            .Where(p => p.SubastaId == subastaId)
            .OrderByDescending(p => p.FechaPuja)
            .AsNoTracking()
            .Select(p => new RespuestaPujaDto
            {
                Id = p.Id,
                Monto = p.Monto,
                FechaPuja = p.FechaPuja,
                CompradorId = p.CompradorId,
                Seudonimo = "Postor #" + p.CompradorId
            })
            .ToListAsync();


    public static RespuestaPujaDto APujaDto(Puja puja) => new()
    {
        Id = puja.Id,
        Monto = puja.Monto,
        FechaPuja = puja.FechaPuja,
        CompradorId = puja.CompradorId,
        Seudonimo = $"Postor #{puja.CompradorId:D3}"
    };
}
