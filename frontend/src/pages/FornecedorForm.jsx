import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { chamar } from '../api';
import { mascaraCnpj, mascaraTelefone } from '../formatadores';
import Aviso from '../components/Aviso';
import Campo from '../components/Campo';

const vazio = {
  nome: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contatoPrincipal: '',
};

export default function FornecedorForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [dados, setDados] = useState(vazio);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!editando) return;

    chamar('GET', `/fornecedores/${id}`)
      .then((fornecedor) => {
        setDados({
          nome: fornecedor.nome,
          cnpj: fornecedor.cnpj,
          endereco: fornecedor.endereco,
          telefone: fornecedor.telefone,
          email: fornecedor.email,
          contatoPrincipal: fornecedor.contatoPrincipal,
        });
      })
      .catch((erro) => setAviso({ tipo: 'erro', texto: erro.message }));
  }, [id, editando]);

  function alterar(campo, tratar = (valor) => valor) {
    return (evento) => {
      setDados({ ...dados, [campo]: tratar(evento.target.value) });
      setErros({ ...erros, [campo]: undefined });
    };
  }

  async function enviar(evento) {
    evento.preventDefault();
    setAviso(null);
    setEnviando(true);

    try {
      if (editando) {
        const resposta = await chamar('PUT', `/fornecedores/${id}`, dados);
        navigate('/fornecedores', { state: { mensagem: resposta.mensagem } });
      } else {
        const resposta = await chamar('POST', '/fornecedores', dados);
        setDados(vazio);
        setErros({});
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
        <h1>{editando ? 'Edição de Fornecedor' : 'Cadastro de Fornecedor'}</h1>
        <Link className="botao secundario" to="/fornecedores">
          Voltar
        </Link>
      </div>

      <Aviso aviso={aviso} />

      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo id="nome" rotulo="Nome da Empresa" obrigatorio erro={erros.nome}>
          <input id="nome" type="text" placeholder="Insira o nome da empresa" value={dados.nome} onChange={alterar('nome')} />
        </Campo>

        <Campo id="cnpj" rotulo="CNPJ" obrigatorio erro={erros.cnpj}>
          <input
            id="cnpj"
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={dados.cnpj}
            onChange={alterar('cnpj', mascaraCnpj)}
          />
        </Campo>

        <Campo id="endereco" rotulo="Endereço" obrigatorio erro={erros.endereco}>
          <textarea
            id="endereco"
            rows="2"
            placeholder="Insira o endereço completo da empresa"
            value={dados.endereco}
            onChange={alterar('endereco')}
          />
        </Campo>

        <Campo id="telefone" rotulo="Telefone" obrigatorio erro={erros.telefone}>
          <input
            id="telefone"
            type="text"
            inputMode="tel"
            placeholder="(00) 0000-0000"
            value={dados.telefone}
            onChange={alterar('telefone', mascaraTelefone)}
          />
        </Campo>

        <Campo id="email" rotulo="E-mail" obrigatorio erro={erros.email}>
          <input id="email" type="email" placeholder="exemplo@fornecedor.com" value={dados.email} onChange={alterar('email')} />
        </Campo>

        <Campo id="contatoPrincipal" rotulo="Contato Principal" obrigatorio erro={erros.contatoPrincipal}>
          <input
            id="contatoPrincipal"
            type="text"
            placeholder="Nome do contato principal"
            value={dados.contatoPrincipal}
            onChange={alterar('contatoPrincipal')}
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
