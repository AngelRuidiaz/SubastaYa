namespace SubastaYa.Api.Servicios;




public class SaldoInsuficienteException : Exception
{
    public SaldoInsuficienteException(decimal disponible, decimal requerido)
        : base($"Saldo insuficiente. Disponible: {disponible}. Requerido: {requerido}.") { }
}


public class SubastaNoActivaException : Exception
{
    public SubastaNoActivaException(int subastaId, string estado)
        : base($"La subasta {subastaId} no acepta pujas porque su estado es {estado}.") { }
}

public class MontoInvalidoException : Exception
{
    public MontoInvalidoException(decimal ofertado, decimal minimo)
        : base($"El monto {ofertado} es invalido. El minimo para pujar es {minimo}.") { }
}

public class ConflictoConcurrenciaException : Exception
{
    public ConflictoConcurrenciaException(string mensaje) : base(mensaje) { }
}


public class NoEncontradoException : Exception
{
    public NoEncontradoException(string mensaje) : base(mensaje) { }
}
