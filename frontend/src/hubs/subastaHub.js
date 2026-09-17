import * as signalR from '@microsoft/signalr'
import { URL_BASE_API } from '../api/cliente'

const URL_HUB = `${URL_BASE_API}/hubs/subastas`

let conexion = null
let promesaInicio = null

function obtenerConexion() {
  if (!conexion) {
    conexion = new signalR.HubConnectionBuilder()
      .withUrl(URL_HUB)
      .withAutomaticReconnect([0, 1000, 3000, 8000, 15000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  }
  return conexion
}

/** Arranca la conexion si hace falta y devuelve el hub ya conectado. */
export async function asegurarConexionHub() {
  const c = obtenerConexion()

  // Si ya hay un start() en curso (por ejemplo, el segundo montaje que hace
  // React.StrictMode en desarrollo), hay que esperar ESE mismo intento en vez
  // de asumir que la conexion ya esta lista solo porque el estado dejo de ser
  // "Disconnected". Sin este chequeo, ese segundo llamado devolvia la conexion
  // de inmediato mientras todavia estaba "Connecting", y el invoke() posterior
  // fallaba por intentar usarla antes de tiempo.
  if (promesaInicio) {
    await promesaInicio
    return c
  }

  if (c.state === signalR.HubConnectionState.Disconnected) {
    promesaInicio = c.start().finally(() => {
      promesaInicio = null
    })
    await promesaInicio
  }
  return c
}

export async function unirseASubasta(subastaId) {
  const c = await asegurarConexionHub()
  await c.invoke('UnirseASubasta', subastaId)
}

export async function salirDeSubasta(subastaId) {
  if (conexion && conexion.state === signalR.HubConnectionState.Connected) {
    try {
      await conexion.invoke('SalirDeSubasta', subastaId)
    } catch {
      // La conexion pudo haberse cerrado en el medio: no es un error real del usuario.
    }
  }
}

/** Suscribe un handler a un evento del hub y devuelve la funcion para desuscribirse. */
export function suscribirseAEvento(evento, manejador) {
  const c = obtenerConexion()
  c.on(evento, manejador)
  return () => c.off(evento, manejador)
}
