import cliente from './cliente'

export async function obtenerHistorialPujas(subastaId) {
  const { data } = await cliente.get(`/api/subastas/${subastaId}/pujas`)
  return data
}

export async function registrarPuja(subastaId, monto) {
  const { data } = await cliente.post(`/api/subastas/${subastaId}/pujas`, { monto })
  return data
}
