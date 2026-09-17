/** Validaciones de formularios en cliente: evitan pegarle al backend con datos invalidos. */

export function validarSubasta(datos) {
  const errores = {}

  if (!datos.titulo || !datos.titulo.trim()) errores.titulo = 'El titulo es obligatorio.'
  else if (datos.titulo.trim().length > 150) errores.titulo = 'El titulo no puede superar los 150 caracteres.'

  if (!datos.descripcion || !datos.descripcion.trim()) errores.descripcion = 'La descripcion es obligatoria.'
  else if (datos.descripcion.trim().length > 2000)
    errores.descripcion = 'La descripcion no puede superar los 2000 caracteres.'

  if (!datos.urlImagen || !datos.urlImagen.trim()) errores.urlImagen = 'La URL de la imagen es obligatoria.'
  else if (!/^https?:\/\/.+/i.test(datos.urlImagen.trim()))
    errores.urlImagen = 'Ingresa una URL valida (debe empezar con http:// o https://).'

  if (!datos.categoriaId) errores.categoriaId = 'Elegi una categoria.'

  const precioBase = Number(datos.precioBase)
  if (!datos.precioBase || Number.isNaN(precioBase) || precioBase <= 0)
    errores.precioBase = 'El precio base debe ser un numero mayor a cero.'

  const incrementoMinimo = Number(datos.incrementoMinimo)
  if (!datos.incrementoMinimo || Number.isNaN(incrementoMinimo) || incrementoMinimo <= 0)
    errores.incrementoMinimo = 'El incremento minimo debe ser un numero mayor a cero.'

  if (!datos.fechaInicio) errores.fechaInicio = 'Elegi la fecha y hora de inicio.'
  if (!datos.fechaFin) errores.fechaFin = 'Elegi la fecha y hora de finalizacion.'

  if (datos.fechaInicio && datos.fechaFin) {
    const inicio = new Date(datos.fechaInicio)
    const fin = new Date(datos.fechaFin)
    if (fin <= inicio) errores.fechaFin = 'La fecha de fin debe ser posterior a la de inicio.'
  }

  return errores
}

export function validarMontoPuja(monto, montoMinimo, saldoDisponible) {
  const numero = Number(monto)
  if (!monto || Number.isNaN(numero)) return 'Ingresa un monto valido.'
  if (numero < montoMinimo) return `El monto debe ser al menos ${montoMinimo}.`
  if (saldoDisponible != null && numero > saldoDisponible) return 'No tenes saldo disponible suficiente para esa oferta.'
  return null
}

export function validarMontoCarga(monto) {
  const numero = Number(monto)
  if (!monto || Number.isNaN(numero)) return 'Ingresa un monto valido.'
  if (numero <= 0) return 'El monto a cargar debe ser mayor a cero.'
  if (numero > 10_000_000) return 'El monto es demasiado alto para una carga simulada.'
  return null
}
