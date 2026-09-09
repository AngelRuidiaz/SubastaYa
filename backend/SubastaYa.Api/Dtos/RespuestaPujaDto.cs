namespace SubastaYa.Api.Dtos;

 
public class RespuestaPujaDto
{
    public int Id { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaPuja { get; set; }
    public int CompradorId { get; set; }
    public string Seudonimo { get; set; } = string.Empty;
}


public class ResultadoPujaDto
{
    public int PujaId { get; set; }
    public int SubastaId { get; set; }
    public decimal Monto { get; set; }
    public DateTime NuevaFechaFin { get; set; }
    public bool HuboExtensionAntiSniping { get; set; }
    public decimal SaldoDisponibleRestante { get; set; }
}
