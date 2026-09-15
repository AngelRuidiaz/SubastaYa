import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useUsuario } from '../../contexto/ContextoUsuario'
import { useBilletera } from '../../contexto/ContextoBilletera'
import { formatearMoneda } from '../../utils/formato'

const ENLACES = [
  { a: '/', texto: 'Catálogo', exacto: true },
  { a: '/publicar', texto: 'Publicar' },
  { a: '/billetera', texto: 'Billetera' },
  { a: '/mis-actividades', texto: 'Mis actividades' },
]

function clasesEnlace({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-brasa-50 text-brasa-700' : 'text-tinta-700 hover:bg-crema-100 hover:text-brasa-700'
  }`
}

export default function Navbar() {
  const { usuarios, usuarioActual, cambiarUsuario, cargando } = useUsuario()
  const { balance } = useBilletera()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-crema-200 bg-crema-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 shrink-0" aria-label="SubastaYa, ir al catálogo">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brasa-500 to-ambar-500 text-white shadow-calido">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.5 3.5 6 6M4 20l3.5-1 8.4-8.4a2.1 2.1 0 0 0-3-3L4.5 16l-1 3.5.5.5Zm7.6-11.6 3 3"
                />
              </svg>
            </span>
            <span className="font-heading text-lg font-bold text-tinta-900">
              Subasta<span className="text-brasa-600">Ya</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {ENLACES.map((enlace) => (
              <NavLink key={enlace.a} to={enlace.a} end={enlace.exacto} className={clasesEnlace}>
                {enlace.texto}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/billetera"
            className="hidden items-center gap-1.5 rounded-full bg-exito-50 px-3 py-1.5 text-xs font-bold text-exito-600 ring-1 ring-inset ring-exito-500/20 transition hover:bg-exito-500 hover:text-white sm:flex"
            title="Saldo disponible"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M4 5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4Zm6 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
            </svg>
            {balance ? formatearMoneda(balance.saldoDisponible) : '—'}
          </NavLink>

          <div className="hidden sm:block">
            <label htmlFor="selector-usuario" className="sr-only">
              Usuario de demostración
            </label>
            <select
              id="selector-usuario"
              value={usuarioActual?.id ?? ''}
              disabled={cargando || usuarios.length === 0}
              onChange={(e) => cambiarUsuario(e.target.value)}
              className="min-h-[44px] rounded-lg border border-crema-200 bg-white px-3 py-2 text-sm font-medium text-tinta-900 focus:border-brasa-500 focus:outline-none focus:ring-2 focus:ring-brasa-100 disabled:opacity-50"
            >
              {usuarios.length === 0 && <option>Sin usuarios</option>}
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-lg text-tinta-700 hover:bg-crema-100 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-crema-200 bg-crema-50 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Principal móvil">
            {ENLACES.map((enlace) => (
              <NavLink key={enlace.a} to={enlace.a} end={enlace.exacto} className={clasesEnlace} onClick={() => setMenuAbierto(false)}>
                {enlace.texto}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-crema-200 pt-3">
            <select
              value={usuarioActual?.id ?? ''}
              disabled={cargando || usuarios.length === 0}
              onChange={(e) => cambiarUsuario(e.target.value)}
              className="min-h-[44px] flex-1 rounded-lg border border-crema-200 bg-white px-3 py-2 text-sm font-medium"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
            <span className="rounded-full bg-exito-50 px-3 py-2 text-xs font-bold text-exito-600">
              {balance ? formatearMoneda(balance.saldoDisponible) : '—'}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
