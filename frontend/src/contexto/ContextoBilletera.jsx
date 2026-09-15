import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { obtenerBalance } from '../api/billetera'
import { useUsuario } from './ContextoUsuario'

const ContextoBilletera = createContext(null)

export function ProveedorBilletera({ children }) {
  const { usuarioActual } = useUsuario()
  const [balance, setBalance] = useState(null)
  const [cargando, setCargando] = useState(false)

  const refrescar = useCallback(async () => {
    if (!usuarioActual) return
    setCargando(true)
    try {
      const datos = await obtenerBalance(usuarioActual.id)
      setBalance(datos)
    } catch {
      
    } finally {
      setCargando(false)
    }
  }, [usuarioActual])

  useEffect(() => {
    setBalance(null)
    if (usuarioActual) refrescar()
  }, [usuarioActual, refrescar])

  return <ContextoBilletera.Provider value={{ balance, cargando, refrescar }}>{children}</ContextoBilletera.Provider>
}

export function useBilletera() {
  const ctx = useContext(ContextoBilletera)
  if (!ctx) throw new Error('useBilletera debe usarse dentro de <ProveedorBilletera>.')
  return ctx
}
