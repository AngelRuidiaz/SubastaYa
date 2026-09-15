import { Link } from 'react-router-dom'
import Boton from '../componentes/comunes/Boton'

export default function NoEncontrada() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-heading text-6xl font-extrabold text-brasa-200">404</p>
      <h1 className="font-heading text-xl font-bold text-tinta-900">No encontramos esta página</h1>
      <p className="max-w-sm text-sm text-tinta-500">El enlace puede estar roto o la subasta ya no existe.</p>
      <Link to="/">
        <Boton>Volver al catálogo</Boton>
      </Link>
    </div>
  )
}
