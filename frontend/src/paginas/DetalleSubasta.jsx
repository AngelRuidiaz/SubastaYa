import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obtenerDetalleSubasta } from '../api/subastas'
import { useUsuario } from '../contexto/ContextoUsuario'
import { useBilletera } from '../contexto/ContextoBilletera'
import { useToasts } from '../contexto/ContextoToasts'
import { useSubastaHub } from '../hooks/useSubastaHub'
import { formatearMoneda } from '../utils/formato'
import { formatearFechaHora } from '../utils/fecha'
import EstadoBadge from '../componentes/comunes/EstadoBadge'
import { CargandoPagina } from '../componentes/comunes/Spinner'
import ErrorCarga from '../componentes/comunes/ErrorCarga'
import Temporizador from '../componentes/subasta/Temporizador'
import ConsolaPuja from '../componentes/subasta/ConsolaPuja'
import HistorialPujas from '../componentes/subasta/HistorialPujas'

export default function DetalleSubasta() {
  const { id } = useParams()
  const subastaId = Number(id)
  const navegar = useNavigate()
  const { usuarioActual } = useUsuario()
  const { refrescar: refrescarBilletera } = useBilletera()
  const toasts = useToasts()

  const [subasta, setSubasta] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarDetalle = useCallback(async () => {
    try {
      const data = await obtenerDetalleSubasta(subastaId)
      setSubasta(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [subastaId])

  useEffect(() => {
    setCargando(true)
    cargarDetalle()
  }, [cargarDetalle])

  useSubastaHub(subastaId, {
    onPujaRegistrada: (payload) => {
      setSubasta((prev) => {
        if (!prev || prev.pujas.some((p) => p.id === payload.puja.id)) return prev
        return {
          ...prev,
          pujas: [payload.puja, ...prev.pujas],
          pujaMasAlta: payload.puja.monto,
          cantidadPujas: prev.cantidadPujas + 1,
          liderActualId: payload.puja.compradorId,
          montoMinimoParaPujar: payload.puja.monto + prev.incrementoMinimo,
          fechaFin: payload.fechaFin,
        }
      })
      if (payload.puja.compradorId !== usuarioActual?.id) {
        toasts.info(`Nueva oferta de ${payload.puja.seudonimo}: ${formatearMoneda(payload.puja.monto)}`)
      }
    },
    onFuisteSuperado: (payload) => {
      if (payload.usuarioSuperadoId === usuarioActual?.id) {
        toasts.advertencia('¡Fuiste superado! Alguien ofertó más que vos y tu saldo fue liberado.')
        refrescarBilletera()
      }
    },
    onTiempoExtendido: () => {
      toasts.advertencia('¡Extensión anti-sniping! Se sumaron minutos por una oferta de último momento.')
    },
    onSubastaCerrada: (payload) => {
      setSubasta((prev) => (prev ? { ...prev, estado: payload.estadoFinal } : prev))
      if (payload.ganadorId && payload.ganadorId === usuarioActual?.id) {
        toasts.exito('¡Ganaste esta subasta! El pago se descontó de tu saldo retenido.')
      } else if (payload.estadoFinal === 'Desierta') {
        toasts.info('La subasta finalizó sin recibir ofertas.')
      } else {
        toasts.info('La subasta finalizó.')
      }
      refrescarBilletera()
    },
    onErrorConexion: () => {
      toasts.error('No se pudo conectar al servidor en tiempo real. Los datos podrían no actualizarse solos.')
    },
  })

  if (cargando) return <CargandoPagina mensaje="Cargando la subasta..." />
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargarDetalle} />
  if (!subasta) return null

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navegar(-1)}
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-tinta-500 transition hover:text-brasa-700"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.8 15.4a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4L8.5 9.7l4.3 4.3a1 1 0 010 1.4Z"
            clipRule="evenodd"
          />
        </svg>
        Volver al catálogo
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-crema-200 bg-white">
            <img src={subasta.urlImagen} alt={subasta.titulo} className="aspect-video w-full object-cover" />
          </div>

          <div className="rounded-2xl border border-crema-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <EstadoBadge estado={subasta.estado} />
              <span className="text-xs font-bold uppercase tracking-wide text-brasa-600">{subasta.categoria}</span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-bold text-tinta-900 sm:text-3xl">{subasta.titulo}</h1>
            <p className="mt-1 text-sm text-tinta-500">
              Publicado por <span className="font-semibold text-tinta-700">{subasta.vendedor}</span> · Precio base {formatearMoneda(subasta.precioBase)} ·
              Incremento mínimo {formatearMoneda(subasta.incrementoMinimo)}
            </p>
            <p className="mt-1 text-xs text-tinta-400">
              Inicio: {formatearFechaHora(subasta.fechaInicio)} · Fin: {formatearFechaHora(subasta.fechaFin)}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-tinta-700">{subasta.descripcion}</p>
          </div>

          <div className="rounded-2xl border border-crema-200 bg-white p-5">
            <h2 className="mb-3 font-heading text-base font-bold text-tinta-900">Historial de ofertas</h2>
            <HistorialPujas pujas={subasta.pujas} usuarioActualId={usuarioActual?.id} />
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <Temporizador fechaFin={subasta.fechaFin} activa={subasta.estado === 'Activa'} />
          {usuarioActual && <ConsolaPuja subasta={subasta} usuarioActual={usuarioActual} onNecesitaRecargar={cargarDetalle} />}
          <div className="rounded-2xl border border-crema-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-tinta-400">Oferta más alta</p>
            <p className="mt-1 font-heading text-2xl font-extrabold text-brasa-700">{formatearMoneda(subasta.pujaMasAlta)}</p>
            <p className="mt-1 text-xs text-tinta-400">{subasta.cantidadPujas} oferta(s) realizada(s)</p>
            <Link to="/mis-actividades" className="mt-3 inline-block text-xs font-semibold text-brasa-700 hover:underline">
              Ver mis actividades →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
