import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { chamar, urlImagem } from '../api';
import Aviso from '../components/Aviso';

export default function AssociacaoPage() {
  const { id } = useParams();
  const [produtos, setProdutos] = useState([]);
  const [produtoEscolhido, setProdutoEscolhido] = useState('');
  const [produto, setProduto] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorId, setFornecedorId] = useState('');
  const [aviso, setAviso] = useState(null);

  const idProduto = id || produtoEscolhido;

  function mostrarErro(erro) {
    setAviso({ tipo: 'erro', texto: erro.message });
  }

  useEffect(() => {
    chamar('GET', '/fornecedores').then(setFornecedores).catch(mostrarErro);
    if (!id) {
      chamar('GET', '/produtos').then(setProdutos).catch(mostrarErro);
    }
  }, [id]);

  useEffect(() => {
    setFornecedorId('');
    if (!idProduto) {
      setProduto(null);
      return;
    }
    chamar('GET', `/produtos/${idProduto}`).then(setProduto).catch(mostrarErro);
  }, [idProduto]);

  async function associar() {
    setAviso(null);
    try {
      const resposta = await chamar('POST', `/produtos/${idProduto}/fornecedores`, { fornecedorId });
      setProduto({ ...produto, fornecedores: resposta.fornecedores });
      setFornecedorId('');
      setAviso({ tipo: 'sucesso', texto: resposta.mensagem });
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.erros?.fornecedorId || erro.message });
    }
  }

  async function desassociar(fornecedor) {
    setAviso(null);
    try {
      const resposta = await chamar('DELETE', `/produtos/${idProduto}/fornecedores/${fornecedor.id}`);
      setProduto({ ...produto, fornecedores: resposta.fornecedores });
      setAviso({ tipo: 'sucesso', texto: resposta.mensagem });
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <div className="titulo-linha">
        <h1>Associação de Fornecedor a Produto</h1>
        <Link className="botao secundario" to={id ? '/produtos' : '/'}>
          Voltar
        </Link>
      </div>

      <Aviso aviso={aviso} />

      {!id && (
        <div className="cartao">
          <div className="campo">
            <label htmlFor="produto">Produto</label>
            <select id="produto" value={produtoEscolhido} onChange={(evento) => setProdutoEscolhido(evento.target.value)}>
              <option value="">Selecione um produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.codigoBarras})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {produto && (
        <>
          <div className="cartao">
            <h2>Detalhes do Produto</h2>
            <div className="detalhes">
              <div className="detalhes-campos">
                <div className="campo">
                  <label>Nome do Produto</label>
                  <input type="text" value={produto.nome} readOnly />
                </div>
                <div className="campo">
                  <label>Código de Barras</label>
                  <input type="text" value={produto.codigoBarras} readOnly />
                </div>
                <div className="campo">
                  <label>Descrição</label>
                  <textarea rows="2" value={produto.descricao} readOnly />
                </div>
              </div>
              {produto.imagem && <img className="previa grande" src={urlImagem(produto.imagem)} alt={produto.nome} />}
            </div>
          </div>

          <div className="cartao">
            <h2>Associação de Fornecedor</h2>
            <div className="linha-associar">
              <select value={fornecedorId} onChange={(evento) => setFornecedorId(evento.target.value)} aria-label="Fornecedor">
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} ({f.cnpj})
                  </option>
                ))}
              </select>
              <button className="botao" onClick={associar}>
                Associar Fornecedor
              </button>
            </div>
          </div>

          <div className="cartao">
            <h2>Fornecedores Associados</h2>
            {produto.fornecedores.length === 0 ? (
              <p>Nenhum fornecedor associado a este produto.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nome do Fornecedor</th>
                    <th>CNPJ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {produto.fornecedores.map((fornecedor) => (
                    <tr key={fornecedor.id}>
                      <td>{fornecedor.nome}</td>
                      <td>{fornecedor.cnpj}</td>
                      <td className="acoes">
                        <button className="botao pequeno perigo" onClick={() => desassociar(fornecedor)}>
                          Desassociar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}
