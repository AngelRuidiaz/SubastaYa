/**
 * El backend siempre trabaja en UTC (DateTime.UtcNow), pero segun como Postgres/
 * System.Text.Json serialicen el DateTime puede llegar sin el sufijo "Z". Si no
 * tiene indicador de zona horaria, se lo agregamos para que el navegador no lo
 * interprete como hora local (lo que desincronizaria todos los contadores).
 */
export function analizarFechaUtc(valor) {
  if (!valor) return null
  const cadena = typeof valor === 'string' ? valor : String(valor)
  const tieneZonaHoraria = /[zZ]|[+-]\d{2}:?\d{2}$/.test(cadena)
  return new Date(tieneZonaHoraria ? cadena : `${cadena}Z`)
}

export function segundosHasta(fecha) {
  if (!fecha) return 0
  return Math.max(0, (fecha.getTime() - Date.now()) / 1000)
}

export function formatearFechaHora(valor) {
  const fecha = analizarFechaUtc(valor)
  if (!fecha) return ''
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function formatearDuracion(segundosTotales) {
  const segundos = Math.max(0, Math.floor(segundosTotales))
  const dias = Math.floor(segundos / 86400)
  const horas = Math.floor((segundos % 86400) / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segs = segundos % 60

  const dosDigitos = (n) => String(n).padStart(2, '0')

  if (dias > 0) return `${dias}d ${dosDigitos(horas)}h`
  if (horas > 0) return `${horas}:${dosDigitos(minutos)}:${dosDigitos(segs)}`
  return `${dosDigitos(minutos)}:${dosDigitos(segs)}`
}
