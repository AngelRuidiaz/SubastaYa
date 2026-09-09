namespace SubastaYa.Api.Modelos;

public enum TipoTransaccion
{
    Deposito = 0,    
    Retencion = 1,   
    Liberacion = 2,  
    Pago = 3,        
    Cobro = 4        
}



public class TransaccionLedger
{
    public int Id { get; set; }

    public int BilleteraId { get; set; }
    public Billetera Billetera { get; set; } = null!;

    public TipoTransaccion Tipo { get; set; }
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }

   
    public int? SubastaId { get; set; }
    public Subasta? Subasta { get; set; }
}
