import { formatearMoneda } from '../../utils/formato'

const TARJETAS = [
  {
    clave: 'saldoTotal',
    titulo: 'Saldo total',
    descripcion: 'Fondos depositados',
    clases: 'bg-white border-crema-200 text-tinta-900',
    iconoClase: 'bg-brasa-50 text-brasa-600',
  },
  {
    clave: 'saldoRetenido',
    titulo: 'En garantía (escrow)',
    descripcion: 'Bloqueado en subastas donde lideras',
    clases: 'bg-white border-crema-200 text-tinta-900',
    iconoClase: 'bg-advertencia-50 text-advertencia-600',
  },
  {
    clave: 'saldoDisponible',
    titulo: 'Saldo disponible',
    descripcion: 'Total − retenido: lo que podés usar',
    clases: 'bg-exito-50 border-exito-500/20 text-exito-700',
    iconoClase: 'bg-exito-500 text-white',
  },
]

const ICONOS = {
  saldoTotal: (
    <path d="M4 5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4Zm6 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
  ),
  saldoRetenido: <path d="M5 8V6a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Zm2 0h6V6a3 3 0 0 0-6 0v2Z" />,
  saldoDisponible: (
    <path
      fillRule="evenodd"
      d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
      clipRule="evenodd"
    />
  ),
}

export default function PanelSaldo({ balance, cargando }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TARJETAS.map((t) => (
        <div key={t.clave} className={`rounded-2xl border p-5 ${t.clases}`}>
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.iconoClase}`}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                {ICONOS[t.clave]}
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{t.titulo}</p>
              <p className="text-[11px] opacity-60">{t.descripcion}</p>
            </div>
          </div>
          <p className="mt-4 font-heading text-2xl font-extrabold tabular-nums">
            {cargando || !balance ? '—' : formatearMoneda(balance[t.clave])}
          </p>
        </div>
      ))}
    </div>
  )
}
