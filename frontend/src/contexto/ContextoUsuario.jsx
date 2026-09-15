import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { obtenerUsuariosDemo } from '../api/actividades'
import { establecerUsuarioActual } from '../api/cliente'
import { useToasts } from './ContextoToasts'

const CLAVE_STORAGE = 'subastaya:usuarioId'
const ContextoUsuario = createContext(null)

export function ProveedorUsuario({ children }) {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const toasts = useToasts()

  useEffect(() => {
    let activo = true

    async function cargarUsuarios() {
      try {
        const lista = await obtenerUsuariosDemo()
        if (!activo) return
        setUsuarios(lista)

        const idGuardado = Number(localStorage.getItem(CLAVE_STORAGE))
        const elegido = lista.find((u) => u.id === idGuardado) || lista[0] || null

        if (elegido) {
          setUsuarioActual(elegido)
          establecerUsuarioActual(elegido.id)
          localStorage.setItem(CLAVE_STORAGE, String(elegido.id))
        }
      } catch (error) {
        if (activo) {
          setErrorCarga(error.message || 'No se pudo conectar con el backend.')
          toasts.error('No se pudieron cargar los usuarios de demostracion. ¿Esta el backend corriendo?')
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarUsuarios()
    return () => {
      activo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cambiarUsuario = useCallback(
    (id) => {
      const encontrado = usuarios.find((u) => u.id === Number(id))
      if (!encontrado) return
      setUsuarioActual(encontrado)
      establecerUsuarioActual(encontrado.id)
      localStorage.setItem(CLAVE_STORAGE, String(encontrado.id))
    },
    [usuarios],
  )

  return (
    <ContextoUsuario.Provider value={{ usuarios, usuarioActual, cambiarUsuario, cargando, errorCarga }}>
      {children}
    </ContextoUsuario.Provider>
  )
}

export function useUsuario() {
  const ctx = useContext(ContextoUsuario)
  if (!ctx) throw new Error('useUsuario debe usarse dentro de <ProveedorUsuario>.')
  return ctx
}
