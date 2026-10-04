import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { chamar, urlImagem } from '../api';
import Aviso from '../components/Aviso';
import Campo from '../components/Campo';

const vazio = {
  nome: '',
  codigoBarras: '',
  descricao: '',
  quantidadeEstoque: '',
  categoria: '',
  outraCategoria: '',
  dataValidade: '',
  precoCusto: '',
};

export default function ProdutoForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [dados, setDados] = useState(vazio);
  const [categorias, setCategorias] = useState([]);
  const [imagem, setImagem] = useState(null);
  const [imagemAtual, setImagemAtual] = useState(null);
  const [chaveArquivo, setChaveArquivo] = useState(0);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await chamar('GET', '/categorias');
        setCategorias(lista);

        if (editando) {
          const produto = await chamar('GET', `/produtos/${id}`);
          const conhecida = lista.includes(produto.categoria);
          setDados({
            nome: produto.nome,
            codigoBarras: produto.codigoBarras,
            descricao: produto.descricao,
            quantidadeEstoque: String(produto.quantidadeEstoque),
            categoria: conhecida ? produto.categoria : 'Outro',
            outraCategoria: conhecida ? '' : produto.categoria,
            dataValidade: produto.dataValidade || '',
            precoCusto: produto.precoCusto === null ? '' : String(produto.precoCusto),
          });
          setImagemAtual(produto.imagem);
        }
      } catch (erro) {
        setAviso({ tipo: 'erro', texto: erro.message });
      }
    }

    carregar();
  }, [id, editando]);

  function alterar(campo) {
    return (evento) => {
      setDados({ ...dados, [campo]: evento.target.value });
      setErros({ ...erros, [campo]: undefined });
    };
  }

  async function enviar(evento) {
    evento.preventDefault();
    setAviso(null);

    const categoria = dados.categoria === 'Outro' ? dados.outraCategoria.trim() : dados.categoria;

    const corpo = new FormData();
    corpo.append('nome', dados.nome);
    corpo.append('codigoBarras', dados.codigoBarras);
    corpo.append('descricao', dados.descricao);
    corpo.append('quantidadeEstoque', dados.quantidadeEstoque);
    corpo.append('categoria', categoria);
    corpo.append('dataValidade', dados.dataValidade);
    corpo.append('precoCusto', dados.precoCusto);
    if (imagem) corpo.append('imagem', imagem);

    setEnviando(true);
    try {
      if (editando) {
        const resposta = await chamar('PUT', `/produtos/${id}`, corpo);
        navigate('/produtos', { state: { mensagem: resposta.mensagem } });
      } else {
        const resposta = await chamar('POST', '/produtos', corpo);
        setDados(vazio);
        setErros({});
        setImagem(null);
        setChaveArquivo(chaveArquivo + 1);
        setAviso({ tipo: 'sucesso', texto: resposta.mensagem });
      }
    } catch (erro) {
      setErros(erro.erros || {});
      setAviso({ tipo: 'erro', texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <div className="titulo-linha">
        <h1>{editando ? 'Edição de Produto' : 'Cadastro de Produto'}</h1>
        <Link className="botao secundario" to="/produtos">
          Voltar
        </Link>
      </div>

      <Aviso aviso={aviso} />

      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo id="nome" rotulo="Nome do Produto" obrigatorio erro={erros.nome}>
          <input id="nome" type="text" placeholder="Insira o nome do produto" value={dados.nome} onChange={alterar('nome')} />
        </Campo>

        <Campo id="codigoBarras" rotulo="Código de Barras" obrigatorio erro={erros.codigoBarras}>
          <input
            id="codigoBarras"
            type="text"
            inputMode="numeric"
            placeholder="Insira o código de barras"
            value={dados.codigoBarras}
            onChange={(evento) => {
              setDados({ ...dados, codigoBarras: evento.target.value.replace(/\D/g, '') });
              setErros({ ...erros, codigoBarras: undefined });
            }}
          />
        </Campo>

        <Campo id="descricao" rotulo="Descrição" obrigatorio erro={erros.descricao}>
          <textarea
            id="descricao"
            rows="3"
            placeholder="Descreva brevemente o produto"
            value={dados.descricao}
            onChange={alterar('descricao')}
          />
        </Campo>

        <Campo id="quantidadeEstoque" rotulo="Quantidade em Estoque" erro={erros.quantidadeEstoque}>
          <input
            id="quantidadeEstoque"
            type="text"
            inputMode="numeric"
            placeholder="Quantidade disponível"
            value={dados.quantidadeEstoque}
            onChange={alterar('quantidadeEstoque')}
          />
        </Campo>

        <Campo id="categoria" rotulo="Categoria" obrigatorio erro={erros.categoria}>
          <select id="categoria" value={dados.categoria} onChange={alterar('categoria')}>
            <option value="">Selecione uma categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </Campo>

        {dados.categoria === 'Outro' && (
          <Campo id="outraCategoria" rotulo="Qual categoria?">
            <input
              id="outraCategoria"
              type="text"
              placeholder="Informe a categoria do produto"
              value={dados.outraCategoria}
              onChange={alterar('outraCategoria')}
            />
          </Campo>
        )}

        <Campo id="dataValidade" rotulo="Data de Validade (se aplicável)" erro={erros.dataValidade}>
          <input id="dataValidade" type="date" value={dados.dataValidade} onChange={alterar('dataValidade')} />
        </Campo>

        <Campo id="precoCusto" rotulo="Preço de Custo (opcional)" erro={erros.precoCusto}>
          <input id="precoCusto" type="text" inputMode="decimal" placeholder="0,00" value={dados.precoCusto} onChange={alterar('precoCusto')} />
        </Campo>

        <Campo id="imagem" rotulo="Imagem do Produto (se aplicável)" erro={erros.imagem}>
          {imagemAtual && !imagem && <img className="previa" src={urlImagem(imagemAtual)} alt="Imagem atual do produto" />}
          <input
            key={chaveArquivo}
            id="imagem"
            type="file"
            accept="image/*"
            onChange={(evento) => setImagem(evento.target.files[0] || null)}
          />
        </Campo>

        <div className="formulario-acoes">
          <button className="botao" type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </section>
  );
}
