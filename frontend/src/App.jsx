import { Route, Routes } from 'react-router-dom'
import Layout from './componentes/layout/Layout'
import Catalogo from './paginas/Catalogo'
import DetalleSubasta from './paginas/DetalleSubasta'
import PublicarSubasta from './paginas/PublicarSubasta'
import Billetera from './paginas/Billetera'
import MisActividades from './paginas/MisActividades'
import NoEncontrada from './paginas/NoEncontrada'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Catalogo />} />
        <Route path="/subastas/:id" element={<DetalleSubasta />} />
        <Route path="/publicar" element={<PublicarSubasta />} />
        <Route path="/billetera" element={<Billetera />} />
        <Route path="/mis-actividades" element={<MisActividades />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
