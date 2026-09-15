const CONFIGURACION = {
  Activa: { texto: 'Activa', clases: 'bg-exito-50 text-exito-600 ring-1 ring-inset ring-exito-500/30' },
  Programada: { texto: 'Próxima', clases: 'bg-ambar-50 text-ambar-700 ring-1 ring-inset ring-ambar-500/30' },
  Finalizada: { texto: 'Finalizada', clases: 'bg-crema-100 text-tinta-500 ring-1 ring-inset ring-crema-300' },
  Desierta: { texto: 'Desierta', clases: 'bg-peligro-50 text-peligro-600 ring-1 ring-inset ring-peligro-500/30' },
}

export default function EstadoBadge({ estado, className = '' }) {
  const config = CONFIGURACION[estado] || { texto: estado, clases: 'bg-crema-100 text-tinta-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.clases} ${className}`}>
      {config.texto}
    </span>
  )
}
