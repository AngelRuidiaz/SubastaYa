import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearSubasta, obtenerCategorias } from '../api/subastas'
import { validarSubasta } from '../utils/validaciones'
import { useToasts } from '../contexto/ContextoToasts'
import CampoFormulario, { clasesInput } from '../componentes/comunes/CampoFormulario'
import Boton from '../componentes/comunes/Boton'

const DATOS_INICIALES = {
  categoriaId: '',
  titulo: '',
  descripcion: '',
  urlImagen: '',
  precioBase: '',
  incrementoMinimo: '',
  fechaInicio: '',
  fechaFin: '',
}

function aIsoUtc(valorDatetimeLocal) {
  
  return new Date(valorDatetimeLocal).toISOString()
}

export default function PublicarSubasta() {
  const [categorias, setCategorias] = useState([])
  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const toasts = useToasts()
  const navegar = useNavigate()

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(() => toasts.error('No se pudieron cargar las categorías.'))
   
  }, [])

  function actualizarCampo(campo, valor) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }))
    if (errores[campo]) setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  async function alEnviar(evento) {
    evento.preventDefault()
    const erroresEncontrados = validarSubasta(datos)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) {
      toasts.advertencia('Revisá los campos marcados en rojo.')
      return
    }

    setEnviando(true)
    try {
      const creada = await crearSubasta({
        categoriaId: Number(datos.categoriaId),
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        urlImagen: datos.urlImagen.trim(),
        precioBase: Number(datos.precioBase),
        incrementoMinimo: Number(datos.incrementoMinimo),
        fechaInicio: aIsoUtc(datos.fechaInicio),
        fechaFin: aIsoUtc(datos.fechaFin),
      })
      toasts.exito('¡Tu subasta fue publicada!')
      navegar(`/subastas/${creada.id}`)
    } catch (error) {
      toasts.error(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-tinta-900 sm:text-3xl">Publicar una subasta</h1>
      <p className="mt-1 text-sm text-tinta-500">Completá los datos del producto y la ventana de tiempo en la que va a recibir ofertas.</p>

      <form onSubmit={alEnviar} noValidate className="mt-6 flex flex-col gap-8">
        <fieldset className="flex flex-col gap-4 rounded-2xl border border-crema-200 bg-white p-5">
          <legend className="px-1 font-heading text-base font-bold text-tinta-900">Datos del producto</legend>

          <CampoFormulario etiqueta="Título" id="titulo" error={errores.titulo}>
            <input
              id="titulo"
              className={clasesInput}
              value={datos.titulo}
              maxLength={150}
              placeholder="Ej: Notebook Gamer RTX 4070"
              onChange={(e) => actualizarCampo('titulo', e.target.value)}
            />
          </CampoFormulario>

          <CampoFormulario etiqueta="Descripción detallada" id="descripcion" error={errores.descripcion}>
            <textarea
              id="descripcion"
              rows={4}
              maxLength={2000}
              className={clasesInput}
              value={datos.descripcion}
              placeholder="Contá el estado, características y todo lo que un comprador necesita saber."
              onChange={(e) => actualizarCampo('descripcion', e.target.value)}
            />
          </CampoFormulario>

          <CampoFormulario etiqueta="URL de la imagen" id="urlImagen" error={errores.urlImagen} ayuda="Pegá el link directo a una foto del producto.">
            <input
              id="urlImagen"
              className={clasesInput}
              value={datos.urlImagen}
              placeholder="https://..."
              onChange={(e) => actualizarCampo('urlImagen', e.target.value)}
            />
          </CampoFormulario>

          {datos.urlImagen && !errores.urlImagen && (
            <img src={datos.urlImagen} alt="Vista previa" className="h-40 w-full rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          )}

          <CampoFormulario etiqueta="Categoría" id="categoriaId" error={errores.categoriaId}>
            <select id="categoriaId" className={clasesInput} value={datos.categoriaId} onChange={(e) => actualizarCampo('categoriaId', e.target.value)}>
              <option value="">Elegí una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-2xl border border-crema-200 bg-white p-5">
          <legend className="px-1 font-heading text-base font-bold text-tinta-900">Configuración económica</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoFormulario etiqueta="Precio base inicial" id="precioBase" error={errores.precioBase}>
              <input
                id="precioBase"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                className={clasesInput}
                value={datos.precioBase}
                placeholder="$ 0"
                onChange={(e) => actualizarCampo('precioBase', e.target.value)}
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Incremento mínimo por puja" id="incrementoMinimo" error={errores.incrementoMinimo}>
              <input
                id="incrementoMinimo"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                className={clasesInput}
                value={datos.incrementoMinimo}
                placeholder="$ 0"
                onChange={(e) => actualizarCampo('incrementoMinimo', e.target.value)}
              />
            </CampoFormulario>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-2xl border border-crema-200 bg-white p-5">
          <legend className="px-1 font-heading text-base font-bold text-tinta-900">Ventana temporal</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoFormulario etiqueta="Fecha y hora de inicio" id="fechaInicio" error={errores.fechaInicio}>
              <input
                id="fechaInicio"
                type="datetime-local"
                className={clasesInput}
                value={datos.fechaInicio}
                onChange={(e) => actualizarCampo('fechaInicio', e.target.value)}
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Fecha y hora de finalización" id="fechaFin" error={errores.fechaFin}>
              <input
                id="fechaFin"
                type="datetime-local"
                className={clasesInput}
                value={datos.fechaFin}
                onChange={(e) => actualizarCampo('fechaFin', e.target.value)}
              />
            </CampoFormulario>
          </div>
        </fieldset>

        <div className="flex justify-end gap-3">
          <Boton tipo="submit" cargando={enviando}>
            Publicar subasta
          </Boton>
        </div>
      </form>
    </div>
  )
}
