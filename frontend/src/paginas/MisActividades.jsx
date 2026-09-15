import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMisCompras, obtenerMisPublicaciones } from '../api/actividades'
import { useUsuario } from '../contexto/ContextoUsuario'
import TarjetaCompra from '../componentes/actividades/TarjetaCompra'
import TarjetaPublicacion from '../componentes/actividades/TarjetaPublicacion'
import { CargandoPagina } from '../componentes/comunes/Spinner'
import ErrorCarga from '../componentes/comunes/ErrorCarga'
import EstadoVacio from '../componentes/comunes/EstadoVacio'
import Boton from '../componentes/comunes/Boton'

const PESTANIAS = [
  { clave: 'compras', texto: 'Mis compras / pujas' },
  { clave: 'publicaciones', texto: 'Mis publicaciones' },
]

export default function MisActividades() {
  const { usuarioActual, cargando: cargandoUsuario } = useUsuario()
  const [pestania, setPestania] = useState('compras')
  const [compras, setCompras] = useState(null)
  const [publicaciones, setPublicaciones] = useState(null)
  const [error, setError] = useState(null)

  function cargarTodo() {
    if (!usuarioActual) return
    setError(null)
    Promise.all([obtenerMisCompras(usuarioActual.id), obtenerMisPublicaciones(usuarioActual.id)])
      .then(([listaCompras, listaPublicaciones]) => {
        setCompras(listaCompras)
        setPublicaciones(listaPublicaciones)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    setCompras(null)
    setPublicaciones(null)
    cargarTodo()
    
  }, [usuarioActual])

  if (cargandoUsuario) return <CargandoPagina mensaje="Cargando actividades..." />
  if (!usuarioActual) return <ErrorCarga mensaje="No hay un usuario de demostración seleccionado." />

  const cargando = compras === null || publicaciones === null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-tinta-900 sm:text-3xl">Mis actividades</h1>
        <p className="mt-1 text-sm text-tinta-500">Seguí tus ofertas y el rendimiento de lo que publicaste.</p>
      </div>

      <div role="tablist" aria-label="Mis actividades" className="flex w-fit gap-1 rounded-xl border border-crema-200 bg-white p-1">
        {PESTANIAS.map((p) => (
          <button
            key={p.clave}
            type="button"
            role="tab"
            aria-selected={pestania === p.clave}
            onClick={() => setPestania(p.clave)}
            className={`min-h-[40px] rounded-lg px-4 text-sm font-semibold transition ${
              pestania === p.clave ? 'bg-brasa-700 text-white shadow-calido' : 'text-tinta-600 hover:bg-crema-100'
            }`}
          >
            {p.texto}
          </button>
        ))}
      </div>

      {error && <ErrorCarga mensaje={error} onReintentar={cargarTodo} />}

      {!error && cargando && <CargandoPagina mensaje="Cargando..." />}

      {!error && !cargando && pestania === 'compras' && (
        <div className="flex flex-col gap-3" role="tabpanel">
          {compras.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no ofertaste en ninguna subasta"
              descripcion="Explorá el catálogo y hacé tu primera oferta."
              accion={
                <Link to="/">
                  <Boton>Ver catálogo</Boton>
                </Link>
              }
            />
          ) : (
            compras.map((c) => <TarjetaCompra key={c.subastaId} participacion={c} />)
          )}
        </div>
      )}

      {!error && !cargando && pestania === 'publicaciones' && (
        <div className="flex flex-col gap-3" role="tabpanel">
          {publicaciones.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no publicaste ninguna subasta"
              descripcion="Publicá tu primer producto y empezá a recibir ofertas."
              accion={
                <Link to="/publicar">
                  <Boton>Publicar subasta</Boton>
                </Link>
              }
            />
          ) : (
            publicaciones.map((p) => <TarjetaPublicacion key={p.id} publicacion={p} />)
          )}
        </div>
      )}
    </div>
  )
}
