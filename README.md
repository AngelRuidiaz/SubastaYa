# SubastaYa

## Requisitos

- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) (para el frontend)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para Postgres)
- Herramienta `dotnet-ef` (solo si vas a resetear la base a mano): `dotnet tool install --global dotnet-ef`
- Git

## Cómo levantar todo el proyecto (backend + frontend)

Necesitás tres terminales abiertas en paralelo: una para la base de datos, una para la API y una para el frontend. El orden importa (la base primero, la API segundo).

```bash
# 1. Clonar
git clone <URL-DEL-REPO>
cd backendSimple
```

### Terminal 1 — Base de datos (Postgres en Docker)

```bash
abrir docker desktop
cd docker
docker compose up -d
```

### Terminal 2 — Backend (API en ASP.NET Core)

```bash
cd backend/SubastaYa.Api
dotnet restore
dotnet run
```

La API queda escuchando en `http://localhost:5108` (perfil `http` de `launchSettings.json`). Al arrancar:

- Aplica las migraciones de EF Core automáticamente (`Database.MigrateAsync`).
- Carga datos de prueba si la base está vacía (4 usuarios, 4 categorías, 5 subastas en distintos estados).
- Expone Swagger en `http://localhost:5108/swagger`.
- Habilita CORS para `http://localhost:5173` (el frontend en desarrollo) — configurable en `appsettings.json` → `OrigenesPermitidosCors`.
- Levanta el hub de SignalR en `/hubs/subastas` para las actualizaciones en vivo de la sala de subasta.

### Terminal 3 — Frontend (React + Vite)

```bash
cd frontend
npm install          # solo la primera vez
cp .env.example .env  # en PowerShell: copy .env.example .env
npm run dev
```

El frontend queda disponible en `http://localhost:5173`. La variable `VITE_API_URL` en `.env` apunta a `http://localhost:5108`


### Para bajar todo

```bash
# Backend y frontend: Ctrl+C en sus terminales

# Base de datos
cd docker
docker compose down       # agregá -v si además querés borrar los datos
```

## Reiniciar la base de datos (borrar todo lo cargado y volver a migrar)


Hay dos formas, elegí una:

### Opción A — `dotnet ef` (recomendada, no toca el contenedor de Docker)

Con el contenedor de Postgres corriendo (`docker compose up -d` en `docker/`) y el backend detenido:

```bash
cd backend/SubastaYa.Api

# Instalar la herramienta una sola vez, si no la tenés
dotnet tool install --global dotnet-ef

# Borra la base de datos completa (todas las tablas y filas)
dotnet ef database drop -f

# Vuelve a crear el esquema aplicando todas las migraciones desde cero
dotnet ef database update

# Arrancar de nuevo: al iniciar detecta la base vacía y recarga los datos semilla
dotnet run
```

### Opción B — Recrear el contenedor de Docker (borra el volumen de datos)

```bash
cd docker
docker compose down -v   # -v elimina también el volumen con los datos de Postgres
docker compose up -d

cd ../backend/SubastaYa.Api
dotnet run                # al arrancar aplica las migraciones y siembra los datos de nuevo
```


## Configuración / conexión a la base de datos

La cadena de conexión vive en `backend/SubastaYa.Api/appsettings.json` (clave `ConnectionStrings:BaseDatos`) y usa las mismas credenciales que `docker/docker-compose.yml`, pensadas **solo para desarrollo local**. Si necesitás apuntar a otra base (por ejemplo en CI o en otra máquina), sobrescribí la cadena de conexión con una variable de entorno en vez de editar el archivo:

```bash
export ConnectionStrings__BaseDatos="Host=...;Port=5432;Database=...;Username=...;Password=..."
```


## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/subastas` | Catálogo con filtros, orden y paginado |
| GET | `/api/subastas/{id}` | Detalle de una subasta |
| POST | `/api/subastas` | Publicar una subasta |
| GET | `/api/categorias` | Listado de categorías |
| GET | `/api/subastas/{subastaId}/pujas` | Historial de pujas de una subasta |
| POST | `/api/subastas/{subastaId}/pujas` | Registrar una puja |
| GET | `/api/billeteras/{usuarioId}` | Balance de la billetera |
| GET | `/api/billeteras/{usuarioId}/movimientos` | Historial contable (ledger) |
| POST | `/api/billeteras/{usuarioId}/depositos` | Cargar saldo simulado |
| GET | `/api/usuarios` | Usuarios de demostración (selector del frontend) |
| GET | `/api/usuarios/{usuarioId}/pujas` | "Mis compras" |
| GET | `/api/usuarios/{usuarioId}/subastas` | "Mis publicaciones" |

También hay un hub de SignalR en `/hubs/subastas` para actualizaciones en vivo.

## Probar el control de concurrencia

Con la API corriendo, desde otra terminal:

```bash
# Git Bash / Linux / macOS
bash docs/prueba-concurrencia.sh [PUERTO] [SUBASTA_ID] [MONTO]

# PowerShell
./docs/prueba-concurrencia.ps1 -Puerto 5000 -SubastaId 1 -Monto 60000
```

Dispara dos pujas simultáneas: se espera un `201 Created` y un `409 Conflict`.

> Verificado en esta sesión con `bash docs/prueba-concurrencia.sh 5108 1 50000`: resultado `HTTP 201` para un usuario y `HTTP 409` para el otro, confirmando que el `Version` (concurrency token) de EF Core rechaza correctamente la segunda escritura simultánea.


## Auditoría (Audit Log)

Toda acción crítica del negocio queda registrada en la tabla `Auditoria`, de forma inmutable (solo inserts), con `Entidad`, `EntidadId`, `Accion`, `UsuarioId` (nulo si la ejecutó el worker) y un `DetalleJson` con el detalle del evento. Se auditan los 4 casos que exige la consigna:

- **Cambios de estado de subastas ejecutados por el worker**: `SUBASTA_ACTIVADA`, `CIERRE_WORKER` (finalizada con liquidación), `SUBASTA_DESIERTA`.
- **Extensiones de tiempo por la regla anti-sniping**: `EXTENSION_TIEMPO`.
- **Intentos de puja rechazados**: `PUJA_RECHAZADA_CONCURRENCIA` (conflicto optimista) y `PUJA_RECHAZADA_VALIDACION` (saldo, monto o estado inválido).
- **Acreditaciones manuales de saldo**: `ACREDITACION_SALDO`.

 Verificado en esta sesión consultando la tabla directamente (`docker exec subastaya-postgres psql -U subastaya -d subastaya -c 'SELECT ... FROM "Auditoria"'`): aparecieron registros de los 4 tipos tras ejercitar el worker, una puja rechazada por validación, un conflicto de concurrencia, una extensión anti-sniping y un depósito manual.



