import Boton from './Boton'

export default function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-peligro-500/20 bg-peligro-50 px-6 py-14 text-center">
      <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-peligro-500">
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01M10.3 3.9 2.4 17.5a1.6 1.6 0 0 0 1.4 2.4h16.4a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0Z"
        />
      </svg>
      <p className="max-w-sm text-sm font-medium text-peligro-600">{mensaje || 'Ocurrio un error al cargar los datos.'}</p>
      {onReintentar && (
        <Boton variante="peligro" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  )
}
