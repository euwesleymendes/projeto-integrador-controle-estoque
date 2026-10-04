import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import ProdutosPage from './pages/ProdutosPage';
import ProdutoForm from './pages/ProdutoForm';
import FornecedoresPage from './pages/FornecedoresPage';
import FornecedorForm from './pages/FornecedorForm';
import AssociacaoPage from './pages/AssociacaoPage';

export default function App() {
  return (
    <>
      <header className="topo">
        <div className="topo-conteudo">
          <span className="marca">Controle de Estoque</span>
          <nav>
            <NavLink to="/produtos">Produtos</NavLink>
            <NavLink to="/fornecedores">Fornecedores</NavLink>
            <NavLink to="/associacao">Associação</NavLink>
          </nav>
        </div>
      </header>

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/produtos/novo" element={<ProdutoForm />} />
          <Route path="/produtos/:id/editar" element={<ProdutoForm />} />
          <Route path="/produtos/:id/fornecedores" element={<AssociacaoPage />} />
          <Route path="/fornecedores" element={<FornecedoresPage />} />
          <Route path="/fornecedores/novo" element={<FornecedorForm />} />
          <Route path="/fornecedores/:id/editar" element={<FornecedorForm />} />
          <Route path="/associacao" element={<AssociacaoPage />} />
          <Route path="*" element={<p>Página não encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
