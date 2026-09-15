const ESTADOS = [
  { valor: '', texto: 'Todos los estados' },
  { valor: 'Activa', texto: 'Activas' },
  { valor: 'Programada', texto: 'Próximas' },
  { valor: 'Finalizada', texto: 'Finalizadas' },
]

const ORDENES = [
  { valor: '', texto: 'Menor tiempo restante' },
  { valor: 'mayorpuja', texto: 'Mayor puja' },
  { valor: 'masrecientes', texto: 'Más recientes' },
]

const clasesSelect =
  'min-h-[44px] rounded-lg border border-crema-200 bg-white px-3 py-2 text-sm font-medium text-tinta-900 focus:border-brasa-500 focus:outline-none focus:ring-2 focus:ring-brasa-100'

export default function FiltrosCatalogo({ categorias, valores, onCambiar, onLimpiar }) {
  const hayFiltrosActivos =
    valores.estado || valores.categoriaId || valores.precioMinimo || valores.precioMaximo || valores.orden

  return (
    <div className="rounded-2xl border border-crema-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-estado" className="text-xs font-semibold text-tinta-500">
            Estado
          </label>
          <select
            id="filtro-estado"
            className={clasesSelect}
            value={valores.estado}
            onChange={(e) => onCambiar({ estado: e.target.value })}
          >
            {ESTADOS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-categoria" className="text-xs font-semibold text-tinta-500">
            Categoría
          </label>
          <select
            id="filtro-categoria"
            className={clasesSelect}
            value={valores.categoriaId}
            onChange={(e) => onCambiar({ categoriaId: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-precio-min" className="text-xs font-semibold text-tinta-500">
            Precio mínimo
          </label>
          <input
            id="filtro-precio-min"
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="$ 0"
            className={`${clasesSelect} w-32`}
            value={valores.precioMinimo}
            onChange={(e) => onCambiar({ precioMinimo: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-precio-max" className="text-xs font-semibold text-tinta-500">
            Precio máximo
          </label>
          <input
            id="filtro-precio-max"
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Sin límite"
            className={`${clasesSelect} w-32`}
            value={valores.precioMaximo}
            onChange={(e) => onCambiar({ precioMaximo: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-orden" className="text-xs font-semibold text-tinta-500">
            Ordenar por
          </label>
          <select
            id="filtro-orden"
            className={clasesSelect}
            value={valores.orden}
            onChange={(e) => onCambiar({ orden: e.target.value })}
          >
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={onLimpiar}
            className="ml-auto flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brasa-700 transition hover:bg-brasa-50"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.4 4.9a1 1 0 00-1.5 1.4L8.6 10l-3.7 3.7a1 1 0 101.4 1.4L10 11.4l3.7 3.7a1 1 0 001.4-1.4L11.4 10l3.7-3.7a1 1 0 00-1.4-1.4L10 8.6 6.4 4.9z" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
