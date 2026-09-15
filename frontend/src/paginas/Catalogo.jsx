import { useEffect, useState } from 'react'
import { buscarSubastas, obtenerCategorias } from '../api/subastas'
import SubastaCard from '../componentes/subastas/SubastaCard'
import FiltrosCatalogo from '../componentes/subastas/FiltrosCatalogo'
import Paginador from '../componentes/subastas/Paginador'
import ErrorCarga from '../componentes/comunes/ErrorCarga'
import EstadoVacio from '../componentes/comunes/EstadoVacio'

const FILTROS_INICIALES = { estado: '', categoriaId: '', precioMinimo: '', precioMaximo: '', orden: '' }

function TarjetaEsqueleto() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-crema-200 bg-white">
      <div className="aspect-[4/3] bg-crema-100" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-crema-100" />
        <div className="h-4 w-full rounded bg-crema-100" />
        <div className="h-4 w-2/3 rounded bg-crema-100" />
        <div className="h-6 w-1/2 rounded bg-crema-100" />
      </div>
    </div>
  )
}

export default function Catalogo() {
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)

    const temporizador = setTimeout(() => {
      buscarSubastas({
        estado: filtros.estado || undefined,
        categoriaId: filtros.categoriaId || undefined,
        precioMinimo: filtros.precioMinimo || undefined,
        precioMaximo: filtros.precioMaximo || undefined,
        orden: filtros.orden || undefined,
        pagina,
        tamanioPagina: 12,
      })
        .then((data) => {
          if (activo) setResultado(data)
        })
        .catch((err) => {
          if (activo) setError(err.message)
        })
        .finally(() => {
          if (activo) setCargando(false)
        })
    }, 350)

    return () => {
      activo = false
      clearTimeout(temporizador)
    }
  }, [filtros, pagina, version])

  function cambiarFiltros(cambios) {
    setFiltros((actuales) => ({ ...actuales, ...cambios }))
    setPagina(1)
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
    setPagina(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-tinta-900 sm:text-3xl">Explorá las subastas</h1>
        <p className="mt-1 text-sm text-tinta-500">Fondos reales en garantía y juego limpio anti-sniping en cada puja.</p>
      </div>

      <FiltrosCatalogo categorias={categorias} valores={filtros} onCambiar={cambiarFiltros} onLimpiar={limpiarFiltros} />

      {error && <ErrorCarga mensaje={error} onReintentar={() => setVersion((v) => v + 1)} />}

      {!error && cargando && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TarjetaEsqueleto key={i} />
          ))}
        </div>
      )}

      {!error && !cargando && resultado && resultado.elementos.length === 0 && (
        <EstadoVacio
          titulo="No encontramos subastas"
          descripcion="Probá ajustar los filtros o el rango de precios para ver más resultados."
          icono={
            <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 17.5A7.5 7.5 0 1 0 10 2.5a7.5 7.5 0 0 0 0 15Zm11.5 4-5-5"
              />
            </svg>
          }
        />
      )}

      {!error && !cargando && resultado && resultado.elementos.length > 0 && (
        <>
          <p className="text-sm text-tinta-500">{resultado.totalElementos} subastas encontradas</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resultado.elementos.map((subasta) => (
              <SubastaCard key={subasta.id} subasta={subasta} />
            ))}
          </div>
          <Paginador pagina={resultado.pagina} totalPaginas={resultado.totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
