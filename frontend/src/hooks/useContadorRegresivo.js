import { useEffect, useState } from 'react'
import { analizarFechaUtc, segundosHasta } from '../utils/fecha'

/**
 * Cuenta regresiva contra una fecha de fin absoluta (UTC). Recalcula los segundos
 * restantes contra el reloj real en cada tick, en vez de simplemente restar 1 por
 * segundo, para no arrastrar desincronizaciones si la pestaña queda en segundo plano.
 */
export function useContadorRegresivo(fechaFin) {
  const [segundosRestantes, setSegundosRestantes] = useState(() => segundosHasta(analizarFechaUtc(fechaFin)))

  useEffect(() => {
    const fecha = analizarFechaUtc(fechaFin)
    setSegundosRestantes(segundosHasta(fecha))

    const intervalo = setInterval(() => {
      setSegundosRestantes(segundosHasta(fecha))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [fechaFin])

  return {
    segundosRestantes,
    vencida: segundosRestantes <= 0,
    critico: segundosRestantes > 0 && segundosRestantes <= 10,
    urgente: segundosRestantes > 0 && segundosRestantes <= 60,
  }
}
