import { Link } from 'react-router-dom'
import { formatearMoneda } from '../../utils/formato'
import { formatearFechaHora } from '../../utils/fecha'
import EstadoVacio from '../comunes/EstadoVacio'

const CONFIGURACION_TIPO = {
  Deposito: { texto: 'Depósito', signo: '+', clases: 'text-exito-600 bg-exito-50' },
  Retencion: { texto: 'Retención (garantía)', signo: '', clases: 'text-advertencia-600 bg-advertencia-50' },
  Liberacion: { texto: 'Liberación', signo: '', clases: 'text-brasa-600 bg-brasa-50' },
  Pago: { texto: 'Pago (débito final)', signo: '-', clases: 'text-peligro-600 bg-peligro-50' },
  Cobro: { texto: 'Cobro (venta)', signo: '+', clases: 'text-exito-600 bg-exito-50' },
}

export default function TablaMovimientos({ movimientos }) {
  if (!movimientos || movimientos.length === 0) {
    return <EstadoVacio titulo="Todavía no hay movimientos" descripcion="Tus depósitos, retenciones y pagos van a aparecer acá." />
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-crema-200 bg-white">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-crema-200 text-xs font-bold uppercase tracking-wide text-tinta-400">
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Subasta</th>
            <th className="px-4 py-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov) => {
            const config = CONFIGURACION_TIPO[mov.tipo] || { texto: mov.tipo, signo: '', clases: 'text-tinta-500 bg-crema-100' }
            return (
              <tr key={mov.id} className="border-b border-crema-100 last:border-0">
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.clases}`}>{config.texto}</span>
                </td>
                <td className="px-4 py-3 text-tinta-500">{formatearFechaHora(mov.fecha)}</td>
                <td className="px-4 py-3 text-tinta-500">
                  {mov.subastaId ? (
                    <Link to={`/subastas/${mov.subastaId}`} className="font-medium text-brasa-700 hover:underline">
                      #{mov.subastaId}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-right font-heading font-bold text-tinta-900">
                  {config.signo}
                  {formatearMoneda(mov.monto)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
