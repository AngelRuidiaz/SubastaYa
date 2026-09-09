using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Datos;


public static class DatosSemilla
{
    public static async Task CargarAsync(AplicacionDbContext contexto)
    {
        if (await contexto.Usuarios.AnyAsync()) return;   // ya sembrado

        var ahora = DateTime.UtcNow;

        // ---------------- 4 USUARIOS CON SUS BILLETERAS ----------------
        // 

        var vendedor = new Usuario
        {
            Email = "vendedor@test.com",
            Nombre = "Vendedor Demo",
            PasswordHash = "hash-demo",
            FechaRegistro = ahora.AddDays(-30),
            Billetera = new Billetera { SaldoTotal = 0m, SaldoRetenido = 0m }
        };

        var comprador1 = new Usuario
        {
            Email = "comprador1@test.com",
            Nombre = "Comprador Uno",
            PasswordHash = "hash-demo",
            FechaRegistro = ahora.AddDays(-20),
            
            Billetera = new Billetera { SaldoTotal = 150_000m, SaldoRetenido = 45_000m }
        };

        var comprador2 = new Usuario
        {
            Email = "comprador2@test.com",
            Nombre = "Comprador Dos",
            PasswordHash = "hash-demo",
            FechaRegistro = ahora.AddDays(-15),

            Billetera = new Billetera { SaldoTotal = 200_000m, SaldoRetenido = 25_000m }
        };

        var sinFondos = new Usuario
        {
            Email = "sinfondos@test.com",
            Nombre = "Sin Fondos",
            PasswordHash = "hash-demo",
            FechaRegistro = ahora.AddDays(-5),
            Billetera = new Billetera { SaldoTotal = 500m, SaldoRetenido = 0m }
        };

        contexto.Usuarios.AddRange(vendedor, comprador1, comprador2, sinFondos);
        await contexto.SaveChangesAsync();

        // ---------------- 4 CATEGORIAS ----------------
        var tecnologia     = new Categoria { Nombre = "Tecnologia",     UrlIcono = "https://cdn-icons-png.flaticon.com/128/2777/2777154.png" };
        var coleccionables = new Categoria { Nombre = "Coleccionables", UrlIcono = "https://cdn-icons-png.flaticon.com/128/3081/3081986.png" };
        var indumentaria   = new Categoria { Nombre = "Indumentaria",   UrlIcono = "https://cdn-icons-png.flaticon.com/128/863/863684.png" };
        var vehiculos      = new Categoria { Nombre = "Vehiculos",      UrlIcono = "https://cdn-icons-png.flaticon.com/128/741/741407.png" };

        contexto.Categorias.AddRange(tecnologia, coleccionables, indumentaria, vehiculos);
        await contexto.SaveChangesAsync();

        // ---------------- 5 SUBASTAS (los 5 casos de prueba) ----------------

        
        var activa = new Subasta
        {
            VendedorId = vendedor.Id,
            CategoriaId = tecnologia.Id,
            Titulo = "Notebook Gamer RTX 4070",
            Descripcion = "Notebook 16 pulgadas, 32 GB de RAM, SSD de 1 TB. Usada, impecable.",
            UrlImagen = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
            PrecioBase = 30_000m,
            IncrementoMinimo = 1_000m,
            FechaInicio = ahora.AddHours(-2),
            FechaFin = ahora.AddMinutes(25),
            Estado = EstadoSubasta.Activa
        };


        var critica = new Subasta
        {
            VendedorId = vendedor.Id,
            CategoriaId = coleccionables.Id,
            Titulo = "Reloj de coleccion 1970",
            Descripcion = "Pieza original de coleccionista, funcionando, con caja.",
            UrlImagen = "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
            PrecioBase = 10_000m,
            IncrementoMinimo = 500m,
            FechaInicio = ahora.AddHours(-1),
            FechaFin = ahora.AddSeconds(90),
            Estado = EstadoSubasta.Activa
        };


        var programada = new Subasta
        {
            VendedorId = vendedor.Id,
            CategoriaId = vehiculos.Id,
            Titulo = "Camioneta 4x4 2018",
            Descripcion = "Motor 2.8 turbodiesel, 90.000 km, service al dia.",
            UrlImagen = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            PrecioBase = 500_000m,
            IncrementoMinimo = 10_000m,
            FechaInicio = ahora.AddHours(24),
            FechaFin = ahora.AddHours(48),
            Estado = EstadoSubasta.Programada
        };


        var vencidaConGanador = new Subasta
        {
            VendedorId = vendedor.Id,
            CategoriaId = indumentaria.Id,
            Titulo = "Campera de cuero vintage",
            Descripcion = "Cuero legitimo, talle L, poco uso.",
            UrlImagen = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
            PrecioBase = 20_000m,
            IncrementoMinimo = 1_000m,
            FechaInicio = ahora.AddHours(-3),
            FechaFin = ahora.AddMinutes(-10),
            Estado = EstadoSubasta.Activa
        };


        var vencidaDesierta = new Subasta
        {
            VendedorId = vendedor.Id,
            CategoriaId = tecnologia.Id,
            Titulo = "Teclado mecanico retro",
            Descripcion = "Switches azules, cable desmontable.",
            UrlImagen = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
            PrecioBase = 15_000m,
            IncrementoMinimo = 500m,
            FechaInicio = ahora.AddHours(-4),
            FechaFin = ahora.AddMinutes(-30),
            Estado = EstadoSubasta.Activa
        };

        contexto.Subastas.AddRange(activa, critica, programada, vencidaConGanador, vencidaDesierta);
        await contexto.SaveChangesAsync();

        // ---------------- PUJAS ----------------

        contexto.Pujas.AddRange(
            new Puja { SubastaId = activa.Id, CompradorId = comprador2.Id, Monto = 42_000m, FechaPuja = ahora.AddMinutes(-40) },
            new Puja { SubastaId = activa.Id, CompradorId = comprador1.Id, Monto = 45_000m, FechaPuja = ahora.AddMinutes(-15) },
            new Puja { SubastaId = vencidaConGanador.Id, CompradorId = comprador2.Id, Monto = 25_000m, FechaPuja = ahora.AddMinutes(-45) }
        );
        await contexto.SaveChangesAsync();

        // ---------------- LIBRO MAYOR ----------------
        // Cada peso de las billeteras se explica sumando estos asientos.
        contexto.Transacciones.AddRange(
            new TransaccionLedger { BilleteraId = comprador1.Billetera.Id, Tipo = TipoTransaccion.Deposito, Monto = 150_000m, Fecha = ahora.AddDays(-20) },
            new TransaccionLedger { BilleteraId = comprador2.Billetera.Id, Tipo = TipoTransaccion.Deposito, Monto = 200_000m, Fecha = ahora.AddDays(-15) },
            new TransaccionLedger { BilleteraId = sinFondos.Billetera.Id,  Tipo = TipoTransaccion.Deposito, Monto = 500m,     Fecha = ahora.AddDays(-5)  },

            // comprador2 pujo 42.000 y fue superado: se retuvo y despues se libero.
            new TransaccionLedger { BilleteraId = comprador2.Billetera.Id, Tipo = TipoTransaccion.Retencion,  Monto = 42_000m, Fecha = ahora.AddMinutes(-40), SubastaId = activa.Id },
            new TransaccionLedger { BilleteraId = comprador2.Billetera.Id, Tipo = TipoTransaccion.Liberacion, Monto = 42_000m, Fecha = ahora.AddMinutes(-15), SubastaId = activa.Id },

            // comprador1 es el lider actual: sus 45.000 siguen congelados.
            new TransaccionLedger { BilleteraId = comprador1.Billetera.Id, Tipo = TipoTransaccion.Retencion,  Monto = 45_000m, Fecha = ahora.AddMinutes(-15), SubastaId = activa.Id },

            // comprador2 gano la subasta vencida: 25.000 esperando al worker.
            new TransaccionLedger { BilleteraId = comprador2.Billetera.Id, Tipo = TipoTransaccion.Retencion,  Monto = 25_000m, Fecha = ahora.AddMinutes(-45), SubastaId = vencidaConGanador.Id }
        );
        await contexto.SaveChangesAsync();
    }
}
