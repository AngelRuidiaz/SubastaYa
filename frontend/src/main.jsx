import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProveedorUsuario } from './contexto/ContextoUsuario.jsx'
import { ProveedorToasts } from './contexto/ContextoToasts.jsx'
import { ProveedorBilletera } from './contexto/ContextoBilletera.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorToasts>
        <ProveedorUsuario>
          <ProveedorBilletera>
            <App />
          </ProveedorBilletera>
        </ProveedorUsuario>
      </ProveedorToasts>
    </BrowserRouter>
  </React.StrictMode>,
)
