const formateadorMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function formatearMoneda(valor) {
  const numero = Number(valor)
  if (Number.isNaN(numero)) return formateadorMoneda.format(0)
  return formateadorMoneda.format(numero)
}

export function formatearNumero(valor) {
  return new Intl.NumberFormat('es-AR').format(Number(valor) || 0)
}
