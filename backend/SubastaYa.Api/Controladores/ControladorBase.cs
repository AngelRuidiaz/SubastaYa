using Microsoft.AspNetCore.Mvc;

namespace SubastaYa.Api.Controladores;




[ApiController]
public abstract class ControladorBase : ControllerBase
{
    protected int UsuarioActualId
    {
        get
        {
            if (!Request.Headers.TryGetValue("X-Usuario-Id", out var valor) ||
                !int.TryParse(valor, out var id))
            {
                throw new ArgumentException("Falta el header Usuario-Id con el id del usuario.");
            }

            return id;
        }
    }
}
