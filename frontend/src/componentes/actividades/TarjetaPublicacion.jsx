import { Link } from 'react-router-dom'
import EstadoBadge from '../comunes/EstadoBadge'
import { formatearMoneda, formatearNumero } from '../../utils/formato'
import { formatearFechaHora } from '../../utils/fecha'

export default function TarjetaPublicacion({ publicacion }) {
  return (
    <Link
      to={`/subastas/${publicacion.id}`}
      className="flex items-center gap-4 rounded-2xl border border-crema-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-calido"
    >
      <img src={publicacion.urlImagen} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <EstadoBadge estado={publicacion.estado} />
        <h3 className="mt-1 truncate font-heading text-sm font-bold text-tinta-900">{publicacion.titulo}</h3>
        <p className="text-xs text-tinta-400">
          Fin: {formatearFechaHora(publicacion.fechaFin)} · {formatearNumero(publicacion.cantidadPujas)} oferta(s)
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-tinta-400">Mejor oferta</p>
        <p className="font-heading font-bold text-tinta-900">{formatearMoneda(publicacion.mejorOferta)}</p>
        {publicacion.estado === 'Finalizada' && (
          <p className="mt-1 text-xs font-semibold text-exito-600">Recaudado: {formatearMoneda(publicacion.recaudado)}</p>
        )}
      </div>
    </Link>
  )
}
