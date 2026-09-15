import { useState } from 'react'
import { cargarSaldo } from '../../api/billetera'
import { validarMontoCarga } from '../../utils/validaciones'
import { useToasts } from '../../contexto/ContextoToasts'
import { clasesInput } from '../comunes/CampoFormulario'
import Boton from '../comunes/Boton'

const MONTOS_RAPIDOS = [5000, 20000, 50000, 100000]

export default function FormCargaSaldo({ usuarioId, onCargaExitosa }) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const toasts = useToasts()

  async function cargar(montoElegido) {
    const mensajeError = validarMontoCarga(montoElegido)
    if (mensajeError) {
      setError(mensajeError)
      return
    }

    setEnviando(true)
    setError(null)
    try {
      const balance = await cargarSaldo(usuarioId, Number(montoElegido))
      toasts.exito('¡Saldo acreditado con éxito!')
      setMonto('')
      onCargaExitosa?.(balance)
    } catch (err) {
      toasts.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="rounded-2xl border border-crema-200 bg-white p-5">
      <h2 className="font-heading text-base font-bold text-tinta-900">Cargar saldo (simulado)</h2>
      <p className="mt-1 text-xs text-tinta-500">Acreditá fondos ficticios para poder participar de las subastas.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {MONTOS_RAPIDOS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={enviando}
            onClick={() => cargar(m)}
            className="min-h-[40px] rounded-full border border-crema-200 bg-crema-50 px-3.5 text-sm font-semibold text-tinta-700 transition hover:border-brasa-300 hover:bg-brasa-50 hover:text-brasa-700 disabled:opacity-50"
          >
            + ${m.toLocaleString('es-AR')}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          cargar(monto)
        }}
        noValidate
        className="mt-4 flex items-end gap-3"
      >
        <div className="flex-1">
          <label htmlFor="monto-carga" className="text-xs font-semibold text-tinta-500">
            Otro monto
          </label>
          <input
            id="monto-carga"
            type="number"
            min="1"
            inputMode="decimal"
            placeholder="$ 0"
            className={`${clasesInput} mt-1.5`}
            value={monto}
            disabled={enviando}
            onChange={(e) => {
              setMonto(e.target.value)
              if (error) setError(null)
            }}
          />
        </div>
        <Boton tipo="submit" variante="secundario" cargando={enviando}>
          Cargar
        </Boton>
      </form>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-peligro-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
