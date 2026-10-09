import { NavLink, Route, Routes } from "react-router-dom"

import { FilaDeCredito } from "./paginas/FilaDeCredito"
import { NovoPedido } from "./paginas/NovoPedido"
import { Pedido } from "./paginas/Pedido"
import { Pedidos } from "./paginas/Pedidos"

export function App() {
  return (
    <div className="layout">
      <nav>
        <NavLink to="/">Pedidos</NavLink>
        <NavLink to="/novo">Novo pedido</NavLink>
        <NavLink to="/credito">Crédito</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Pedidos />} />
          <Route path="/novo" element={<NovoPedido />} />
          <Route path="/pedidos/:id" element={<Pedido />} />
          <Route path="/credito" element={<FilaDeCredito />} />
        </Routes>
      </main>
    </div>
  )
}
