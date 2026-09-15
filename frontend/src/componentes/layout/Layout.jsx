import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-crema-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-crema-200 py-6 text-center text-xs text-tinta-400">
        SubastaYa — Proyecto académico de subastas en tiempo real.
      </footer>
    </div>
  )
}
