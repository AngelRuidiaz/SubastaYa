import cliente from './cliente'


export async function buscarSubastas(filtros = {}) {
  const { estado, categoriaId, precioMinimo, precioMaximo, orden, pagina = 1, tamanioPagina = 12 } = filtros
  const { data } = await cliente.get('/api/subastas', {
    params: { estado, categoriaId, precioMinimo, precioMaximo, orden, pagina, tamanioPagina },
  })
  return data
}

export async function obtenerDetalleSubasta(id) {
  const { data } = await cliente.get(`/api/subastas/${id}`)
  return data
}

export async function crearSubasta(datos) {
  const { data } = await cliente.post('/api/subastas', datos)
  return data
}

export async function obtenerCategorias() {
  const { data } = await cliente.get('/api/categorias')
  return data
}
