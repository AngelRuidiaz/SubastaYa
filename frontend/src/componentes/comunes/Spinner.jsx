export default function Spinner({ tamanio = 'md', className = '' }) {
  const tamanios = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' }
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full border-brasa-200 border-t-brasa-600 ${tamanios[tamanio]} ${className}`}
    />
  )
}

export function CargandoPagina({ mensaje = 'Cargando...' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-tinta-500">
      <Spinner tamanio="lg" />
      <p className="text-sm font-medium">{mensaje}</p>
    </div>
  )
}
