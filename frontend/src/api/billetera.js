import cliente from './cliente'

export async function obtenerBalance(usuarioId) {
  const { data } = await cliente.get(`/api/billeteras/${usuarioId}`)
  return data
}

export async function obtenerMovimientos(usuarioId) {
  const { data } = await cliente.get(`/api/billeteras/${usuarioId}/movimientos`)
  return data
}

export async function cargarSaldo(usuarioId, monto) {
  const { data } = await cliente.post(`/api/billeteras/${usuarioId}/depositos`, { monto })
  return data
}
