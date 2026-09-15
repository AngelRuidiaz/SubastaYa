import { Link } from 'react-router-dom'
import EstadoBadge from '../comunes/EstadoBadge'
import { formatearMoneda } from '../../utils/formato'
import { formatearFechaHora } from '../../utils/fecha'

function badgeParticipacion(participacion) {
  if (participacion.gane) return { texto: 'Ganaste', clases: 'bg-exito-500 text-white' }
  if (participacion.estoyLiderando) return { texto: 'Liderando', clases: 'bg-exito-50 text-exito-600' }
  if (participacion.estadoSubasta === 'Activa') return { texto: 'Superado', clases: 'bg-peligro-50 text-peligro-500' }
  return { texto: 'No ganaste', clases: 'bg-crema-100 text-tinta-500' }
}

export default function TarjetaCompra({ participacion }) {
  const badge = badgeParticipacion(participacion)

  return (
    <Link
      to={`/subastas/${participacion.subastaId}`}
      className="flex items-center gap-4 rounded-2xl border border-crema-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-calido"
    >
      <img src={participacion.urlImagen} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <EstadoBadge estado={participacion.estadoSubasta} />
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge.clases}`}>{badge.texto}</span>
        </div>
        <h3 className="mt-1 truncate font-heading text-sm font-bold text-tinta-900">{participacion.titulo}</h3>
        <p className="text-xs text-tinta-400">Fin: {formatearFechaHora(participacion.fechaFin)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-tinta-400">Tu mejor oferta</p>
        <p className="font-heading font-bold text-tinta-900">{formatearMoneda(participacion.miMejorPuja)}</p>
        <p className="mt-1 text-xs text-tinta-400">Actual: {formatearMoneda(participacion.pujaMasAlta)}</p>
      </div>
    </Link>
  )
}
