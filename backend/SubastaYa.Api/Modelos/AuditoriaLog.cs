namespace SubastaYa.Api.Modelos;


public class AuditoriaLog
{
    public int Id { get; set; }


    public string Entidad { get; set; } = string.Empty;

    public int EntidadId { get; set; }


    public string Accion { get; set; } = string.Empty;


    public int? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }


    public string DetalleJson { get; set; } = "{}";

    public DateTime Fecha { get; set; }
}


public static class Acciones
{
    public const string ExtensionTiempo = "EXTENSION_TIEMPO";
    public const string CierreWorker = "CIERRE_WORKER";
    public const string SubastaDesierta = "SUBASTA_DESIERTA";
    public const string SubastaActivada = "SUBASTA_ACTIVADA";
    public const string PujaRechazadaConcurrencia = "PUJA_RECHAZADA_CONCURRENCIA";
    public const string PujaRechazadaValidacion = "PUJA_RECHAZADA_VALIDACION";
    public const string AcreditacionSaldo = "ACREDITACION_SALDO";
}

public static class Entidades
{
    public const string Subasta = "SUBASTA";
    public const string Billetera = "BILLETERA";
    public const string Sistema = "SISTEMA";
}
