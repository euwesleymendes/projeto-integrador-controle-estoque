function texto(valor) {
  if (typeof valor === 'number') return String(valor);
  return typeof valor === 'string' ? valor.trim() : '';
}

function soDigitos(valor) {
  return texto(valor).replace(/\D/g, '');
}

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function formatarCnpj(digitos) {
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatarTelefone(digitos) {
  if (digitos.length === 11) {
    return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
}

function dataValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

function validarFornecedor(corpo) {
  const erros = {};
  const nome = texto(corpo.nome);
  const endereco = texto(corpo.endereco);
  const email = texto(corpo.email);
  const contatoPrincipal = texto(corpo.contatoPrincipal);
  const cnpj = soDigitos(corpo.cnpj);
  const telefone = soDigitos(corpo.telefone);

  if (!nome) {
    erros.nome = 'Informe o nome da empresa';
  } else if (nome.length > 120) {
    erros.nome = 'O nome da empresa deve ter no máximo 120 caracteres';
  }

  if (!texto(corpo.cnpj)) {
    erros.cnpj = 'Informe o CNPJ';
  } else if (cnpj.length !== 14) {
    erros.cnpj = 'CNPJ inválido, use 14 números (00.000.000/0000-00)';
  }

  if (!endereco) {
    erros.endereco = 'Informe o endereço completo da empresa';
  }

  if (!texto(corpo.telefone)) {
    erros.telefone = 'Informe o telefone';
  } else if (telefone.length !== 10 && telefone.length !== 11) {
    erros.telefone = 'Telefone inválido, use o DDD e o número (00) 0000-0000';
  }

  if (!email) {
    erros.email = 'Informe o e-mail';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.email = 'E-mail inválido, use o formato exemplo@fornecedor.com';
  }

  if (!contatoPrincipal) {
    erros.contatoPrincipal = 'Informe o nome do contato principal';
  }

  const dados = {
    nome,
    cnpj: formatarCnpj(cnpj),
    endereco,
    telefone: formatarTelefone(telefone),
    email,
    contatoPrincipal,
  };

  return { erros, dados };
}

function validarProduto(corpo) {
  const erros = {};
  const nome = texto(corpo.nome);
  const codigoBarras = texto(corpo.codigoBarras);
  const descricao = texto(corpo.descricao);
  const categoria = texto(corpo.categoria);
  const dataValidade = texto(corpo.dataValidade);
  const quantidadeTexto = texto(corpo.quantidadeEstoque);
  const precoTexto = texto(corpo.precoCusto);

  if (!nome) {
    erros.nome = 'Informe o nome do produto';
  } else if (nome.length > 120) {
    erros.nome = 'O nome do produto deve ter no máximo 120 caracteres';
  }

  if (!codigoBarras) {
    erros.codigoBarras = 'Informe o código de barras';
  } else if (!/^\d{8,14}$/.test(codigoBarras)) {
    erros.codigoBarras = 'O código de barras deve ter de 8 a 14 números';
  }

  if (!descricao) {
    erros.descricao = 'Descreva brevemente o produto';
  } else if (descricao.length > 500) {
    erros.descricao = 'A descrição deve ter no máximo 500 caracteres';
  }

  let quantidadeEstoque = 0;
  if (quantidadeTexto) {
    quantidadeEstoque = Number(quantidadeTexto);
    if (!Number.isInteger(quantidadeEstoque) || quantidadeEstoque < 0) {
      erros.quantidadeEstoque = 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero';
    }
  }

  if (!categoria) {
    erros.categoria = 'Selecione a categoria';
  } else if (categoria.length > 60) {
    erros.categoria = 'A categoria deve ter no máximo 60 caracteres';
  }

  if (dataValidade && !dataValida(dataValidade)) {
    erros.dataValidade = 'Data de validade inválida, use o formato AAAA-MM-DD';
  }

  let precoCusto = null;
  if (precoTexto) {
    precoCusto = Number(precoTexto.replace(',', '.'));
    if (!Number.isFinite(precoCusto) || precoCusto < 0) {
      erros.precoCusto = 'O preço de custo deve ser um número maior ou igual a zero';
    } else {
      precoCusto = Math.round(precoCusto * 100) / 100;
    }
  }

  const dados = {
    nome,
    codigoBarras,
    descricao,
    quantidadeEstoque,
    categoria,
    dataValidade: dataValidade || null,
    precoCusto,
  };

  return { erros, dados };
}

module.exports = { lerId, validarFornecedor, validarProduto };
