import cliente from './cliente'

/** Usuarios de demostracion (no hay login real: se elige uno del selector). */
export async function obtenerUsuariosDemo() {
  const { data } = await cliente.get('/api/usuarios')
  return data
}

export async function obtenerMisCompras(usuarioId) {
  const { data } = await cliente.get(`/api/usuarios/${usuarioId}/pujas`)
  return data
}

export async function obtenerMisPublicaciones(usuarioId) {
  const { data } = await cliente.get(`/api/usuarios/${usuarioId}/subastas`)
  return data
}
