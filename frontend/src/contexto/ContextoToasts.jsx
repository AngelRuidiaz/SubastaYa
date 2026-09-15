import { createContext, useCallback, useContext, useState } from 'react'

const ContextoToasts = createContext(null)

let contadorIds = 0

const ESTILOS_POR_TIPO = {
  exito: 'bg-exito-500 text-white',
  error: 'bg-peligro-500 text-white',
  advertencia: 'bg-advertencia-500 text-tinta-900',
  info: 'bg-tinta-900 text-white',
}

const ICONOS_POR_TIPO = {
  exito: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  advertencia: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
      <path
        fillRule="evenodd"
        d="M8.3 3.4a1.9 1.9 0 013.4 0l6.4 11.4A1.9 1.9 0 0116.4 17.6H3.6a1.9 1.9 0 01-1.7-2.8L8.3 3.4zM10 8a1 1 0 011 1v3a1 1 0 11-2 0V9a1 1 0 011-1zm0 7a1.1 1.1 0 100-2.2A1.1 1.1 0 0010 15z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-3a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

export function ProveedorToasts({ children }) {
  const [toasts, setToasts] = useState([])

  const quitar = useCallback((id) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id))
  }, [])

  const mostrar = useCallback(
    (mensaje, opciones = {}) => {
      const { tipo = 'info', duracionMs = 5000 } = opciones
      const id = ++contadorIds
      setToasts((actuales) => [...actuales, { id, mensaje, tipo }])
      if (duracionMs > 0) setTimeout(() => quitar(id), duracionMs)
      return id
    },
    [quitar],
  )

  const valor = {
    mostrar,
    quitar,
    exito: (mensaje, opciones) => mostrar(mensaje, { ...opciones, tipo: 'exito' }),
    error: (mensaje, opciones) => mostrar(mensaje, { ...opciones, tipo: 'error' }),
    info: (mensaje, opciones) => mostrar(mensaje, { ...opciones, tipo: 'info' }),
    advertencia: (mensaje, opciones) => mostrar(mensaje, { ...opciones, tipo: 'advertencia' }),
  }

  return (
    <ContextoToasts.Provider value={valor}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto"
        role="region"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm animate-entrada items-start gap-3 rounded-xl px-4 py-3 shadow-calido ${ESTILOS_POR_TIPO[toast.tipo]}`}
          >
            {ICONOS_POR_TIPO[toast.tipo]}
            <p className="flex-1 text-sm font-medium leading-snug">{toast.mensaje}</p>
            <button
              type="button"
              onClick={() => quitar(toast.id)}
              className="shrink-0 rounded-full p-0.5 opacity-80 transition hover:opacity-100"
              aria-label="Cerrar notificacion"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.4 4.9a1 1 0 00-1.5 1.4L8.6 10l-3.7 3.7a1 1 0 101.4 1.4L10 11.4l3.7 3.7a1 1 0 001.4-1.4L11.4 10l3.7-3.7a1 1 0 00-1.4-1.4L10 8.6 6.4 4.9z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ContextoToasts.Provider>
  )
}

export function useToasts() {
  const ctx = useContext(ContextoToasts)
  if (!ctx) throw new Error('useToasts debe usarse dentro de <ProveedorToasts>.')
  return ctx
}
