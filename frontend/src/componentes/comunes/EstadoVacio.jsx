export default function EstadoVacio({ titulo, descripcion, icono, accion }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-crema-300 bg-crema-25 px-6 py-16 text-center">
      {icono && <div className="text-brasa-300">{icono}</div>}
      <h3 className="text-lg font-semibold text-tinta-900">{titulo}</h3>
      {descripcion && <p className="max-w-sm text-sm text-tinta-500">{descripcion}</p>}
      {accion}
    </div>
  )
}
