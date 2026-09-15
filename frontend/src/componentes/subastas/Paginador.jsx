export default function Paginador({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null

  const paginas = []
  for (let p = Math.max(1, pagina - 2); p <= Math.min(totalPaginas, pagina + 2); p++) paginas.push(p)

  const botonClase = (activo) =>
    `grid h-10 w-10 place-items-center rounded-lg text-sm font-semibold transition ${
      activo ? 'bg-brasa-700 text-white shadow-calido' : 'text-tinta-700 hover:bg-crema-100'
    }`

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Paginado del catálogo">
      <button
        type="button"
        disabled={pagina <= 1}
        onClick={() => onCambiar(pagina - 1)}
        className="grid h-10 w-10 place-items-center rounded-lg text-tinta-700 transition hover:bg-crema-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.8 15.4a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4L8.5 9.7l4.3 4.3a1 1 0 010 1.4Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {paginas[0] > 1 && <span className="px-1 text-tinta-400">…</span>}

      {paginas.map((p) => (
        <button key={p} type="button" onClick={() => onCambiar(p)} className={botonClase(p === pagina)} aria-current={p === pagina ? 'page' : undefined}>
          {p}
        </button>
      ))}

      {paginas[paginas.length - 1] < totalPaginas && <span className="px-1 text-tinta-400">…</span>}

      <button
        type="button"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
        className="grid h-10 w-10 place-items-center rounded-lg text-tinta-700 transition hover:bg-crema-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M7.2 4.6a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4l4.3-4.3-4.3-4.3a1 1 0 010-1.4Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </nav>
  )
}
