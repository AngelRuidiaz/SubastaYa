namespace SubastaYa.Api.Modelos;

public enum EstadoSubasta
{
    Programada = 0,   
    Activa = 1,       
    Finalizada = 2,   
    Desierta = 3      
}

public class Subasta
{
    
    public const int SegundosAntiSniping = 60;

   
    public const int MinutosDeExtension = 2;

    public int Id { get; set; }

    public int VendedorId { get; set; }
    public Usuario Vendedor { get; set; } = null!;

    public int CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;

    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string UrlImagen { get; set; } = string.Empty;

    public decimal PrecioBase { get; set; }
    public decimal IncrementoMinimo { get; set; }

    
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }

    public EstadoSubasta Estado { get; set; } = EstadoSubasta.Programada;

    
    public int Version { get; set; } = 1;

    public List<Puja> Pujas { get; set; } = new();

    // ---------------- Reglas de la subasta ----------------

   
    public decimal MontoLider() => Pujas.Count == 0 ? PrecioBase : Pujas.Max(p => p.Monto);

    
    public decimal MontoMinimoParaPujar() =>
        Pujas.Count == 0 ? PrecioBase : MontoLider() + IncrementoMinimo;

    public Puja? PujaLider() => Pujas.OrderByDescending(p => p.Monto).FirstOrDefault();

    
    public bool EstaEnZonaAntiSniping(DateTime ahoraUtc) =>
        (FechaFin - ahoraUtc).TotalSeconds <= SegundosAntiSniping;

    public bool EstaVencida(DateTime ahoraUtc) => FechaFin <= ahoraUtc;

    
    public void ExtenderPorAntiSniping()
    {
        FechaFin = FechaFin.AddMinutes(MinutosDeExtension);
        Version++;
    }


    public void RegistrarActividadDePuja() => Version++;

    public void CambiarEstado(EstadoSubasta nuevoEstado)
    {
        Estado = nuevoEstado;
        Version++;
    }
}
