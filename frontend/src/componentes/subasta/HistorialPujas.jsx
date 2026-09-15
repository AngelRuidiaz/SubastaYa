import { formatearMoneda } from '../../utils/formato'
import { analizarFechaUtc } from '../../utils/fecha'
import EstadoVacio from '../comunes/EstadoVacio'

const formateadorHora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export default function HistorialPujas({ pujas, usuarioActualId, idsNuevas }) {
  if (!pujas || pujas.length === 0) {
    return <EstadoVacio titulo="Todavía no hay ofertas" descripcion="Sé el primero en pujar por este producto." />
  }

  return (
    <ol className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
      {pujas.map((puja, indice) => {
        const esPropia = puja.compradorId === usuarioActualId
        const esLider = indice === 0
        const esNueva = idsNuevas?.has(puja.id)

        return (
          <li
            key={puja.id}
            className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition ${
              esNueva ? 'animate-entrada' : ''
            } ${esLider ? 'border-exito-500/30 bg-exito-50' : 'border-crema-200 bg-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  esPropia ? 'bg-brasa-600 text-white' : 'bg-crema-100 text-tinta-500'
                }`}
              >
                {puja.seudonimo.replace('Postor #', '#')}
              </span>
              <div>
                <p className="text-sm font-semibold text-tinta-900">
                  {esPropia ? 'Vos' : puja.seudonimo}
                  {esLider && <span className="ml-1.5 text-xs font-bold text-exito-600">· Liderando</span>}
                </p>
                <p className="text-xs text-tinta-400">{formateadorHora.format(analizarFechaUtc(puja.fechaPuja))}</p>
              </div>
            </div>
            <span className="shrink-0 font-heading text-sm font-bold text-tinta-900">{formatearMoneda(puja.monto)}</span>
          </li>
        )
      })}
    </ol>
  )
}
