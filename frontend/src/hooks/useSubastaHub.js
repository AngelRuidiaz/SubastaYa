import { useEffect, useRef } from 'react'
import { asegurarConexionHub, salirDeSubasta, suscribirseAEvento, unirseASubasta } from '../hubs/subastaHub'

/**
 * Une al cliente a la sala de la subasta y despacha los eventos en vivo del hub
 * (PujaRegistrada, FuisteSuperado, TiempoExtendido, SubastaCerrada) a los callbacks
 * indicados. Se resuscribe solo cuando cambia el id de subasta.
 */
export function useSubastaHub(subastaId, manejadores) {
  const manejadoresRef = useRef(manejadores)
  manejadoresRef.current = manejadores

  useEffect(() => {
    if (!subastaId) return undefined
    let cancelado = false

    const bajas = [
      suscribirseAEvento('PujaRegistrada', (payload) => {
        if (!cancelado && payload.subastaId === subastaId) manejadoresRef.current.onPujaRegistrada?.(payload)
      }),
      suscribirseAEvento('FuisteSuperado', (payload) => {
        if (!cancelado && payload.subastaId === subastaId) manejadoresRef.current.onFuisteSuperado?.(payload)
      }),
      suscribirseAEvento('TiempoExtendido', (payload) => {
        if (!cancelado && payload.subastaId === subastaId) manejadoresRef.current.onTiempoExtendido?.(payload)
      }),
      suscribirseAEvento('SubastaCerrada', (payload) => {
        if (!cancelado && payload.subastaId === subastaId) manejadoresRef.current.onSubastaCerrada?.(payload)
      }),
    ]

    asegurarConexionHub()
      .then(() => unirseASubasta(subastaId))
      .catch(() => manejadoresRef.current.onErrorConexion?.())

    return () => {
      cancelado = true
      bajas.forEach((baja) => baja())
      salirDeSubasta(subastaId)
    }
  }, [subastaId])
}
