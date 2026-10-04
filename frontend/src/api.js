export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export class ErroApi extends Error {
  constructor(mensagem, status = 0, erros = {}) {
    super(mensagem);
    this.status = status;
    this.erros = erros;
  }
}

export async function chamar(metodo, rota, corpo) {
  const opcoes = { method: metodo, headers: {} };

  if (corpo instanceof FormData) {
    opcoes.body = corpo;
  } else if (corpo !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetch(API_URL + rota, opcoes);
  } catch {
    throw new ErroApi(
      'Não foi possível conectar ao servidor. Se ele estiver no plano gratuito do Render, pode levar cerca de 1 minuto para acordar. Tente de novo.'
    );
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ErroApi(dados?.mensagem || 'Erro inesperado no servidor', resposta.status, dados?.erros || {});
  }

  return dados;
}

export function urlImagem(caminho) {
  return caminho ? API_URL + caminho : null;
}
