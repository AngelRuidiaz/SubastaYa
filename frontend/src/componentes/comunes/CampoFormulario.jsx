export default function CampoFormulario({ etiqueta, error, ayuda, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-tinta-700">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="text-xs text-tinta-400">{ayuda}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-peligro-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export const clasesInput =
  'w-full rounded-lg border border-crema-200 bg-white px-3.5 py-2.5 text-sm text-tinta-900 placeholder:text-tinta-400 transition focus:border-brasa-500 focus:outline-none focus:ring-2 focus:ring-brasa-100'
