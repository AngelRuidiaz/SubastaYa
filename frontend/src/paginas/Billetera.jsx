import { useEffect, useState } from 'react'
import { obtenerMovimientos } from '../api/billetera'
import { useUsuario } from '../contexto/ContextoUsuario'
import { useBilletera } from '../contexto/ContextoBilletera'
import PanelSaldo from '../componentes/billetera/PanelSaldo'
import FormCargaSaldo from '../componentes/billetera/FormCargaSaldo'
import TablaMovimientos from '../componentes/billetera/TablaMovimientos'
import { CargandoPagina } from '../componentes/comunes/Spinner'
import ErrorCarga from '../componentes/comunes/ErrorCarga'

export default function Billetera() {
  const { usuarioActual, cargando: cargandoUsuario } = useUsuario()
  const { balance, cargando: cargandoBalance, refrescar } = useBilletera()
  const [movimientos, setMovimientos] = useState(null)
  const [error, setError] = useState(null)

  function cargarMovimientos() {
    if (!usuarioActual) return
    setError(null)
    obtenerMovimientos(usuarioActual.id)
      .then(setMovimientos)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    setMovimientos(null)
    cargarMovimientos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual])

  if (cargandoUsuario) return <CargandoPagina mensaje="Cargando billetera..." />
  if (!usuarioActual) return <ErrorCarga mensaje="No hay un usuario de demostración seleccionado." />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-tinta-900 sm:text-3xl">Mi billetera</h1>
        <p className="mt-1 text-sm text-tinta-500">{usuarioActual.nombre} · {usuarioActual.email}</p>
      </div>

      <PanelSaldo balance={balance} cargando={cargandoBalance && !balance} />

      <FormCargaSaldo
        usuarioId={usuarioActual.id}
        onCargaExitosa={() => {
          refrescar()
          cargarMovimientos()
        }}
      />

      <div>
        <h2 className="mb-3 font-heading text-lg font-bold text-tinta-900">Historial de movimientos</h2>
        {error ? (
          <ErrorCarga mensaje={error} onReintentar={cargarMovimientos} />
        ) : movimientos === null ? (
          <CargandoPagina mensaje="Cargando movimientos..." />
        ) : (
          <TablaMovimientos movimientos={movimientos} />
        )}
      </div>
    </div>
  )
}
