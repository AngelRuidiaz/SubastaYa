using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Modelos;

namespace SubastaYa.Api.Datos;


public class AplicacionDbContext : DbContext
{
    public AplicacionDbContext(DbContextOptions<AplicacionDbContext> opciones) : base(opciones) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Billetera> Billeteras => Set<Billetera>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Subasta> Subastas => Set<Subasta>();
    public DbSet<Puja> Pujas => Set<Puja>();
    public DbSet<TransaccionLedger> Transacciones => Set<TransaccionLedger>();
    public DbSet<AuditoriaLog> Auditoria => Set<AuditoriaLog>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {

        modelo.Entity<Usuario>(usuario =>
        {
            usuario.Property(u => u.Email).IsRequired().HasMaxLength(150);
            usuario.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
            usuario.Property(u => u.PasswordHash).IsRequired().HasMaxLength(300);
            usuario.HasIndex(u => u.Email).IsUnique();

  
            usuario.HasOne(u => u.Billetera)
                   .WithOne(b => b.Usuario)
                   .HasForeignKey<Billetera>(b => b.UsuarioId)
                   .OnDelete(DeleteBehavior.Cascade);
        });

  
        modelo.Entity<Billetera>(billetera =>
        {
            billetera.Property(b => b.SaldoTotal).HasPrecision(18, 2);
            billetera.Property(b => b.SaldoRetenido).HasPrecision(18, 2);


            billetera.Ignore(b => b.SaldoDisponible);

            // Optimistic Locking.
            billetera.Property(b => b.Version).IsConcurrencyToken();

            billetera.HasIndex(b => b.UsuarioId).IsUnique();
        });


        modelo.Entity<Categoria>(categoria =>
        {
            categoria.Property(c => c.Nombre).IsRequired().HasMaxLength(60);
            categoria.Property(c => c.UrlIcono).HasMaxLength(300);
            categoria.HasIndex(c => c.Nombre).IsUnique();
        });

    
        modelo.Entity<Subasta>(subasta =>
        {
            subasta.Property(s => s.Titulo).IsRequired().HasMaxLength(150);
            subasta.Property(s => s.Descripcion).IsRequired().HasMaxLength(2000);
            subasta.Property(s => s.UrlImagen).HasMaxLength(500);
            subasta.Property(s => s.PrecioBase).HasPrecision(18, 2);
            subasta.Property(s => s.IncrementoMinimo).HasPrecision(18, 2);


            subasta.Property(s => s.Estado).HasConversion<string>().HasMaxLength(20);

            subasta.Property(s => s.Version).IsConcurrencyToken();


            subasta.HasOne(s => s.Vendedor)
                   .WithMany(u => u.SubastasPublicadas)
                   .HasForeignKey(s => s.VendedorId)
                   .OnDelete(DeleteBehavior.Restrict);

            subasta.HasOne(s => s.Categoria)
                   .WithMany(c => c.Subastas)
                   .HasForeignKey(s => s.CategoriaId)
                   .OnDelete(DeleteBehavior.Restrict);

            subasta.HasIndex(s => new { s.Estado, s.FechaFin });
        });


        modelo.Entity<Puja>(puja =>
        {
            puja.Property(p => p.Monto).HasPrecision(18, 2);

            puja.HasOne(p => p.Subasta)
                .WithMany(s => s.Pujas)
                .HasForeignKey(p => p.SubastaId)
                .OnDelete(DeleteBehavior.Cascade);

            puja.HasOne(p => p.Comprador)
                .WithMany(u => u.PujasRealizadas)
                .HasForeignKey(p => p.CompradorId)
                .OnDelete(DeleteBehavior.Restrict);

            puja.HasIndex(p => new { p.SubastaId, p.Monto });
        });


        modelo.Entity<TransaccionLedger>(transaccion =>
        {
            transaccion.Property(t => t.Monto).HasPrecision(18, 2);
            transaccion.Property(t => t.Tipo).HasConversion<string>().HasMaxLength(20);

            transaccion.HasOne(t => t.Billetera)
                       .WithMany(b => b.Movimientos)
                       .HasForeignKey(t => t.BilleteraId)
                       .OnDelete(DeleteBehavior.Cascade);

            
            transaccion.HasOne(t => t.Subasta)
                       .WithMany()
                       .HasForeignKey(t => t.SubastaId)
                       .IsRequired(false)
                       .OnDelete(DeleteBehavior.SetNull);
        });

        
        modelo.Entity<AuditoriaLog>(log =>
        {
            log.Property(a => a.Entidad).IsRequired().HasMaxLength(50);
            log.Property(a => a.Accion).IsRequired().HasMaxLength(60);
            log.Property(a => a.DetalleJson).HasColumnType("text");

            log.HasOne(a => a.Usuario)
               .WithMany()
               .HasForeignKey(a => a.UsuarioId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.SetNull);

            log.HasIndex(a => new { a.Entidad, a.EntidadId });
        });
    }
}
