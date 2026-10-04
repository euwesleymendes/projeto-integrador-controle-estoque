import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { chamar } from '../api';
import Aviso from '../components/Aviso';

export default function FornecedoresPage() {
  const local = useLocation();
  const [fornecedores, setFornecedores] = useState(null);
  const [produtosAbertos, setProdutosAbertos] = useState({});
  const [aviso, setAviso] = useState(
    local.state?.mensagem ? { tipo: 'sucesso', texto: local.state.mensagem } : null
  );

  useEffect(() => {
    chamar('GET', '/fornecedores')
      .then(setFornecedores)
      .catch((erro) => {
        setFornecedores([]);
        setAviso({ tipo: 'erro', texto: erro.message });
      });
  }, []);

  async function excluir(fornecedor) {
    if (!window.confirm(`Deseja excluir o fornecedor "${fornecedor.nome}"?`)) return;

    try {
      const resposta = await chamar('DELETE', `/fornecedores/${fornecedor.id}`);
      setFornecedores(fornecedores.filter((f) => f.id !== fornecedor.id));
      setAviso({ tipo: 'sucesso', texto: resposta.mensagem });
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.message });
    }
  }

  async function alternarProdutos(fornecedor) {
    if (produtosAbertos[fornecedor.id]) {
      const { [fornecedor.id]: _, ...resto } = produtosAbertos;
      setProdutosAbertos(resto);
      return;
    }

    try {
      const produtos = await chamar('GET', `/fornecedores/${fornecedor.id}/produtos`);
      setProdutosAbertos({ ...produtosAbertos, [fornecedor.id]: produtos });
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <div className="titulo-linha">
        <h1>Fornecedores</h1>
        <Link className="botao" to="/fornecedores/novo">
          Novo fornecedor
        </Link>
      </div>

      <Aviso aviso={aviso} />

      {fornecedores === null && <p>Carregando fornecedores... se o servidor estava parado, isso pode levar cerca de 1 minuto.</p>}

      {fornecedores && fornecedores.length === 0 && <p>Nenhum fornecedor cadastrado ainda.</p>}

      {fornecedores && fornecedores.length > 0 && (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Contato principal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((fornecedor) => (
                <Fragment key={fornecedor.id}>
                  <tr>
                    <td>{fornecedor.nome}</td>
                    <td>{fornecedor.cnpj}</td>
                    <td>{fornecedor.telefone}</td>
                    <td>{fornecedor.email}</td>
                    <td>{fornecedor.contatoPrincipal}</td>
                    <td className="acoes">
                      <button className="botao pequeno" onClick={() => alternarProdutos(fornecedor)}>
                        {produtosAbertos[fornecedor.id] ? 'Ocultar produtos' : 'Ver produtos'}
                      </button>
                      <Link className="botao pequeno secundario" to={`/fornecedores/${fornecedor.id}/editar`}>
                        Editar
                      </Link>
                      <button className="botao pequeno perigo" onClick={() => excluir(fornecedor)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                  {produtosAbertos[fornecedor.id] && (
                    <tr className="linha-detalhe">
                      <td colSpan="6">
                        {produtosAbertos[fornecedor.id].length === 0 ? (
                          <span>Este fornecedor ainda não está associado a nenhum produto.</span>
                        ) : (
                          <ul>
                            {produtosAbertos[fornecedor.id].map((produto) => (
                              <li key={produto.id}>
                                {produto.nome} (código de barras {produto.codigoBarras})
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
