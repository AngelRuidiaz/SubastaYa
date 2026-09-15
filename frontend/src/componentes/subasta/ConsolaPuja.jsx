import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarPuja } from '../../api/pujas'
import { validarMontoPuja } from '../../utils/validaciones'
import { formatearMoneda } from '../../utils/formato'
import { useBilletera } from '../../contexto/ContextoBilletera'
import { useToasts } from '../../contexto/ContextoToasts'
import { clasesInput } from '../comunes/CampoFormulario'
import Boton from '../comunes/Boton'
import Modal from '../comunes/Modal'

export default function ConsolaPuja({ subasta, usuarioActual, onPujaExitosa, onNecesitaRecargar }) {
  const { balance, refrescar } = useBilletera()
  const toasts = useToasts()
  const [monto, setMonto] = useState(subasta.montoMinimoParaPujar)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [modalSaldoAbierto, setModalSaldoAbierto] = useState(false)

  useEffect(() => {
    setMonto(subasta.montoMinimoParaPujar)
    setError(null)
  }, [subasta.montoMinimoParaPujar])

  const esVendedor = usuarioActual && subasta.vendedorId === usuarioActual.id
  const yaParticipo = subasta.pujas.some((p) => p.compradorId === usuarioActual?.id)
  const esLider = usuarioActual && subasta.liderActualId === usuarioActual.id
  const puedePujar = subasta.estado === 'Activa' && !esVendedor

  async function alEnviar(evento) {
    evento.preventDefault()
    if (!usuarioActual) return

    const mensajeError = validarMontoPuja(monto, subasta.montoMinimoParaPujar, balance?.saldoDisponible)
    if (mensajeError) {
      setError(mensajeError)
      return
    }

    setEnviando(true)
    setError(null)
    try {
      const resultado = await registrarPuja(subasta.id, Number(monto))
      toasts.exito('¡Tu oferta fue registrada!')
      refrescar()
      onPujaExitosa?.(resultado)
    } catch (err) {
      if (err.codigo === 'SaldoInsuficiente') {
        setModalSaldoAbierto(true)
      } else if (err.codigo === 'ConflictoConcurrencia') {
        toasts.advertencia(err.message)
        onNecesitaRecargar?.()
      } else {
        toasts.error(err.message)
        onNecesitaRecargar?.()
      }
    } finally {
      setEnviando(false)
    }
  }

  if (esVendedor) {
    return (
      <div className="rounded-2xl border border-crema-200 bg-crema-100 p-5 text-center text-sm font-medium text-tinta-500">
        Sos el vendedor de esta publicación: no podés ofertar en tu propia subasta.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-crema-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-base font-bold text-tinta-900">Hacer una oferta</h2>
        {usuarioActual && yaParticipo && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              esLider ? 'bg-exito-50 text-exito-600' : 'bg-peligro-50 text-peligro-500'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${esLider ? 'bg-exito-500' : 'bg-peligro-500'}`} />
            {esLider ? 'Liderando' : 'Superado'}
          </span>
        )}
      </div>

      {subasta.estado !== 'Activa' ? (
        <p className="rounded-lg bg-crema-100 px-3.5 py-3 text-sm font-medium text-tinta-500">
          {subasta.estado === 'Programada' ? 'Todavía no comenzó a recibir ofertas.' : 'Esta subasta ya finalizó.'}
        </p>
      ) : (
        <form onSubmit={alEnviar} noValidate className="flex flex-col gap-3">
          <div>
            <label htmlFor="monto-puja" className="text-xs font-semibold text-tinta-500">
              Tu oferta (sugerido: {formatearMoneda(subasta.montoMinimoParaPujar)})
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-tinta-400">$</span>
              <input
                id="monto-puja"
                type="number"
                min={subasta.montoMinimoParaPujar}
                step="1"
                inputMode="decimal"
                className={`${clasesInput} pl-7 text-lg font-bold`}
                value={monto}
                disabled={!puedePujar || enviando}
                onChange={(e) => {
                  setMonto(e.target.value)
                  if (error) setError(null)
                }}
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-medium text-peligro-500" role="alert">
                {error}
              </p>
            )}
          </div>

          <Boton tipo="submit" cargando={enviando} disabled={!puedePujar} className="w-full">
            Confirmar oferta
          </Boton>

          {balance && (
            <p className="text-center text-xs text-tinta-400">
              Saldo disponible: <span className="font-semibold text-tinta-700">{formatearMoneda(balance.saldoDisponible)}</span>
            </p>
          )}
        </form>
      )}

      <Modal
        abierto={modalSaldoAbierto}
        onCerrar={() => setModalSaldoAbierto(false)}
        titulo="Saldo insuficiente"
        pie={
          <>
            <Boton variante="suave" onClick={() => setModalSaldoAbierto(false)}>
              Cerrar
            </Boton>
            <Link to="/billetera">
              <Boton variante="secundario">Cargar saldo</Boton>
            </Link>
          </>
        }
      >
        No tenés saldo disponible suficiente para cubrir esta oferta en garantía. Cargá fondos en tu billetera para poder participar.
      </Modal>
    </div>
  )
}
