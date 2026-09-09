namespace SubastaYa.Api.Dtos;


public class RespuestaSubastaDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string UrlImagen { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal PujaMasAlta { get; set; }
    public int CantidadPujas { get; set; }
    public DateTime FechaFin { get; set; }
    public string Estado { get; set; } = string.Empty;

    
    
    
    public double SegundosRestantes { get; set; }
}


public class DetalleSubastaDto : RespuestaSubastaDto
{
    public string Descripcion { get; set; } = string.Empty;
    public string Vendedor { get; set; } = string.Empty;
    public int VendedorId { get; set; }
    public decimal PrecioBase { get; set; }
    public decimal IncrementoMinimo { get; set; }
    public DateTime FechaInicio { get; set; }

    
    public decimal MontoMinimoParaPujar { get; set; }

    
    public int? LiderActualId { get; set; }

    public List<RespuestaPujaDto> Pujas { get; set; } = new();
}


public class PaginaDto<T>
{
    public List<T> Elementos { get; set; } = new();
    public int TotalElementos { get; set; }
    public int Pagina { get; set; }
    public int TamanioPagina { get; set; }
    public int TotalPaginas => (int)Math.Ceiling((double)TotalElementos / TamanioPagina);
}

public class CategoriaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string UrlIcono { get; set; } = string.Empty;
}


public class UsuarioDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
