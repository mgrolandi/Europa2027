import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FamilyFilterProvider } from './context/FamilyFilterContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import CityDetail from './pages/CityDetail'
import Transportes from './pages/Transportes'
import Reservas from './pages/Reservas'
import Documentacion from './pages/Documentacion'
import Familias from './pages/Familias'
import Gastos from './pages/Gastos'
import Pendientes from './pages/Pendientes'
import SupabaseBanner from './components/SupabaseBanner'
import { isConfigured } from './lib/supabase'

function ProtectedApp() {
  const { session, loading } = useAuth()

  if (!isConfigured) return <SupabaseBanner />

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-mono text-sm text-ink-light">Cargando…</p>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <FamilyFilterProvider>
      <Layout>
        <Routes>
          <Route path="/"               element={<Home />}          />
          <Route path="/ciudad/:ciudad" element={<CityDetail />}    />
          <Route path="/familias"       element={<Familias />}      />
          <Route path="/transportes"    element={<Transportes />}   />
          <Route path="/reservas"       element={<Reservas />}      />
          <Route path="/documentacion"  element={<Documentacion />} />
          <Route path="/gastos"         element={<Gastos />}        />
          <Route path="/pendientes"     element={<Pendientes />}    />
        </Routes>
      </Layout>
    </FamilyFilterProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  )
}
