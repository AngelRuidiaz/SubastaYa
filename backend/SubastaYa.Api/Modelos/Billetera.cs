using SubastaYa.Api.Servicios;

namespace SubastaYa.Api.Modelos;

public class Billetera
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    
    public decimal SaldoTotal { get; set; }

    
    public decimal SaldoRetenido { get; set; }


    public decimal SaldoDisponible => SaldoTotal - SaldoRetenido;


    public int Version { get; set; } = 1;

    public List<TransaccionLedger> Movimientos { get; set; } = new();

    

   
    public void Retener(decimal monto)
    {
        if (monto > SaldoDisponible)
            throw new SaldoInsuficienteException(SaldoDisponible, monto);

        SaldoRetenido += monto;
        Version++;
    }

  
    public void Liberar(decimal monto)
    {
        SaldoRetenido -= monto;
        if (SaldoRetenido < 0) SaldoRetenido = 0;  
        Version++;
    }

    
    public void PagarDesdeRetencion(decimal monto)
    {
        SaldoRetenido -= monto;
        SaldoTotal -= monto;
        Version++;
    }

    
    public void Acreditar(decimal monto)
    {
        SaldoTotal += monto;
        Version++;
    }
}
