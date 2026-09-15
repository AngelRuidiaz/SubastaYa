import Spinner from './Spinner'

const VARIANTES = {
  primario: 'bg-brasa-700 text-white hover:bg-brasa-800 focus-visible:outline-brasa-700 shadow-calido',
  secundario: 'bg-ambar-500 text-white hover:bg-ambar-600 focus-visible:outline-ambar-500',
  suave: 'bg-crema-100 text-tinta-900 hover:bg-crema-200 focus-visible:outline-brasa-600',
  peligro: 'bg-peligro-500 text-white hover:bg-peligro-600 focus-visible:outline-peligro-500',
  fantasma: 'bg-transparent text-brasa-700 hover:bg-brasa-50 focus-visible:outline-brasa-600',
}

export default function Boton({
  children,
  variante = 'primario',
  cargando = false,
  disabled = false,
  tipo = 'button',
  className = '',
  ...resto
}) {
  return (
    <button
      type={tipo}
      disabled={disabled || cargando}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {cargando && <Spinner tamanio="sm" className="border-white/40 border-t-white" />}
      {children}
    </button>
  )
}
