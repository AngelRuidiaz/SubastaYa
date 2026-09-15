import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ abierto, onCerrar, titulo, children, pie }) {
  useEffect(() => {
    if (!abierto) return undefined
    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionarTecla)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      document.body.style.overflow = ''
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-tinta-900/50 backdrop-blur-sm" onClick={onCerrar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative w-full max-w-md animate-entrada rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-tinta-900">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-1 text-tinta-400 transition hover:bg-crema-100 hover:text-tinta-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.4 4.9a1 1 0 00-1.5 1.4L8.6 10l-3.7 3.7a1 1 0 101.4 1.4L10 11.4l3.7 3.7a1 1 0 001.4-1.4L11.4 10l3.7-3.7a1 1 0 00-1.4-1.4L10 8.6 6.4 4.9z" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-tinta-700">{children}</div>
        {pie && <div className="mt-6 flex justify-end gap-3">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}
