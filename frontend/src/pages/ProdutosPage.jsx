import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { chamar, urlImagem } from '../api';
import { formatarData, formatarPreco } from '../formatadores';
import Aviso from '../components/Aviso';

export default function ProdutosPage() {
  const local = useLocation();
  const [produtos, setProdutos] = useState(null);
  const [aviso, setAviso] = useState(
    local.state?.mensagem ? { tipo: 'sucesso', texto: local.state.mensagem } : null
  );

  useEffect(() => {
    chamar('GET', '/produtos')
      .then(setProdutos)
      .catch((erro) => {
        setProdutos([]);
        setAviso({ tipo: 'erro', texto: erro.message });
      });
  }, []);

  async function excluir(produto) {
    if (!window.confirm(`Deseja excluir o produto "${produto.nome}"?`)) return;

    try {
      const resposta = await chamar('DELETE', `/produtos/${produto.id}`);
      setProdutos(produtos.filter((p) => p.id !== produto.id));
      setAviso({ tipo: 'sucesso', texto: resposta.mensagem });
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <div className="titulo-linha">
        <h1>Produtos</h1>
        <Link className="botao" to="/produtos/novo">
          Novo produto
        </Link>
      </div>

      <Aviso aviso={aviso} />

      {produtos === null && <p>Carregando produtos... se o servidor estava parado, isso pode levar cerca de 1 minuto.</p>}

      {produtos && produtos.length === 0 && <p>Nenhum produto cadastrado ainda.</p>}

      {produtos && produtos.length > 0 && (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nome</th>
                <th>Código de barras</th>
                <th>Categoria</th>
                <th>Estoque</th>
                <th>Validade</th>
                <th>Preço de custo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>
                    {produto.imagem ? (
                      <img className="miniatura" src={urlImagem(produto.imagem)} alt={produto.nome} />
                    ) : (
                      <div className="miniatura vazia" />
                    )}
                  </td>
                  <td>{produto.nome}</td>
                  <td>{produto.codigoBarras}</td>
                  <td>{produto.categoria}</td>
                  <td>{produto.quantidadeEstoque}</td>
                  <td>{formatarData(produto.dataValidade)}</td>
                  <td>{formatarPreco(produto.precoCusto)}</td>
                  <td className="acoes">
                    <Link className="botao pequeno" to={`/produtos/${produto.id}/fornecedores`}>
                      Fornecedores
                    </Link>
                    <Link className="botao pequeno secundario" to={`/produtos/${produto.id}/editar`}>
                      Editar
                    </Link>
                    <button className="botao pequeno perigo" onClick={() => excluir(produto)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
