import { useContadorRegresivo } from '../../hooks/useContadorRegresivo'
import { formatearDuracion } from '../../utils/fecha'

export default function Temporizador({ fechaFin, activa }) {
  const { segundosRestantes, vencida, critico, urgente } = useContadorRegresivo(fechaFin)

  if (!activa) {
    return (
      <div className="rounded-2xl border border-crema-200 bg-crema-100 p-5 text-center">
        <p className="text-sm font-semibold text-tinta-500">Esta subasta no está aceptando ofertas en este momento.</p>
      </div>
    )
  }

  const colorTexto = critico ? 'text-peligro-500' : urgente ? 'text-advertencia-600' : 'text-tinta-900'
  const colorFondo = critico ? 'bg-peligro-50 ring-peligro-500/30' : urgente ? 'bg-advertencia-50 ring-advertencia-500/30' : 'bg-white ring-crema-200'

  return (
    <div className={`rounded-2xl p-5 text-center ring-1 ring-inset transition-colors ${colorFondo}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-tinta-400">{vencida ? 'Subasta finalizada' : 'Tiempo restante'}</p>
      <p
        className={`mt-1 font-heading text-4xl font-extrabold tabular-nums transition-colors sm:text-5xl ${colorTexto} ${critico && !vencida ? 'animate-pulso-urgente' : ''}`}
        aria-live="polite"
      >
        {vencida ? '00:00' : formatearDuracion(segundosRestantes)}
      </p>
      {urgente && !vencida && (
        <p className={`mt-1 text-xs font-bold ${critico ? 'text-peligro-500' : 'text-advertencia-600'}`}>
          {critico ? '¡Últimos segundos!' : 'Último minuto: cualquier oferta extiende el cierre'}
        </p>
      )}
    </div>
  )
}
