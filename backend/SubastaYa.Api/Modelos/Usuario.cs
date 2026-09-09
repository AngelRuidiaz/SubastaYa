namespace SubastaYa.Api.Modelos;

public class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }

    
    public Billetera Billetera { get; set; } = null!;                        
    public List<Subasta> SubastasPublicadas { get; set; } = new();
    public List<Puja> PujasRealizadas { get; set; } = new();
}
