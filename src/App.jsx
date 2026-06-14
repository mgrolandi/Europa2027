import { Routes, Route } from 'react-router-dom'
import { FamilyFilterProvider } from './context/FamilyFilterContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import CityDetail from './pages/CityDetail'
import Transportes from './pages/Transportes'
import Reservas from './pages/Reservas'
import Documentacion from './pages/Documentacion'
import Gastos from './pages/Gastos'
import Pendientes from './pages/Pendientes'

export default function App() {
  return (
    <FamilyFilterProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ciudad/:ciudad" element={<CityDetail />} />
          <Route path="/transportes" element={<Transportes />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/documentacion" element={<Documentacion />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/pendientes" element={<Pendientes />} />
        </Routes>
      </Layout>
    </FamilyFilterProvider>
  )
}
