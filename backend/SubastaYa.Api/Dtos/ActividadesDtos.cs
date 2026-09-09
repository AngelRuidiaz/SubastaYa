namespace SubastaYa.Api.Dtos;


public class ParticipacionDto
{
    public int SubastaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string UrlImagen { get; set; } = string.Empty;
    public string EstadoSubasta { get; set; } = string.Empty;
    public decimal MiMejorPuja { get; set; }
    public decimal PujaMasAlta { get; set; }
    public bool EstoyLiderando { get; set; }
    public bool Gane { get; set; }
    public DateTime FechaFin { get; set; }
}


public class PublicacionDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string UrlImagen { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public int CantidadPujas { get; set; }
    public decimal MejorOferta { get; set; }
    public decimal Recaudado { get; set; }
    public DateTime FechaFin { get; set; }
}
