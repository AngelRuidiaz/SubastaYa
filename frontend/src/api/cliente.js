import axios from 'axios'

export const URL_BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:5108'

let usuarioActualId = null


export function establecerUsuarioActual(id) {
  usuarioActualId = id
}

export function obtenerUsuarioActual() {
  return usuarioActualId
}

export const cliente = axios.create({
  baseURL: URL_BASE_API,
  timeout: 15000,
})

cliente.interceptors.request.use((config) => {
  if (usuarioActualId != null) {
    config.headers['X-Usuario-Id'] = usuarioActualId
  }
  return config
})


export class ErrorApi extends Error {
  constructor(mensaje, codigo, status) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.codigo = codigo
    this.status = status
  }
}

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response) {
      const { data, status } = error.response
      const mensaje = (data && data.mensaje) || 'Ocurrio un error inesperado en el servidor.'
      const codigo = (data && data.codigo) || 'ErrorDesconocido'
      return Promise.reject(new ErrorApi(mensaje, codigo, status))
    }
    if (error.request) {
      return Promise.reject(
        new ErrorApi(
          'No se pudo conectar con el servidor. Verifica que el backend este corriendo en ' + URL_BASE_API + '.',
          'SinConexion',
          0,
        ),
      )
    }
    return Promise.reject(new ErrorApi(error.message, 'ErrorDesconocido', 0))
  },
)

export default cliente
