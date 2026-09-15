import { Link } from 'react-router-dom'
import EstadoBadge from '../comunes/EstadoBadge'
import { useContadorRegresivo } from '../../hooks/useContadorRegresivo'
import { formatearMoneda, formatearNumero } from '../../utils/formato'
import { formatearDuracion } from '../../utils/fecha'

export default function SubastaCard({ subasta }) {
  const { segundosRestantes, vencida, critico, urgente } = useContadorRegresivo(subasta.fechaFin)
  const esActiva = subasta.estado === 'Activa'

  return (
    <Link
      to={`/subastas/${subasta.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-crema-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-calido focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brasa-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-crema-100">
        <img
          src={subasta.urlImagen}
          alt={subasta.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml;utf8,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23FDF2E9"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="%23A8927F" text-anchor="middle">Sin imagen</text></svg>',
              )
          }}
        />
        <div className="absolute left-2.5 top-2.5">
          <EstadoBadge estado={subasta.estado} className="shadow-sm" />
        </div>
        {esActiva && !vencida && (
          <div
            className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
              critico
                ? 'animate-pulso-urgente bg-peligro-500 text-white'
                : urgente
                  ? 'bg-advertencia-500 text-tinta-900'
                  : 'bg-white/90 text-tinta-900'
            }`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16Zm1-13a1 1 0 10-2 0v5a1 1 0 00.3.7l3 3a1 1 0 001.4-1.4L11 9.6V5Z"
                clipRule="evenodd"
              />
            </svg>
            {formatearDuracion(segundosRestantes)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-bold uppercase tracking-wide text-brasa-600">{subasta.categoria}</span>
        <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug text-tinta-900">{subasta.titulo}</h3>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-xs text-tinta-400">Oferta actual</p>
            <p className="font-heading text-lg font-bold text-brasa-700">{formatearMoneda(subasta.pujaMasAlta)}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-tinta-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M10 2a5 5 0 015 5c0 2.1-1.3 3.9-3 4.6V15h3a1 1 0 110 2H5a1 1 0 110-2h3v-3.4C6.3 10.9 5 9.1 5 7a5 5 0 015-5Z" />
            </svg>
            {formatearNumero(subasta.cantidadPujas)} {subasta.cantidadPujas === 1 ? 'oferta' : 'ofertas'}
          </div>
        </div>
      </div>
    </Link>
  )
}
