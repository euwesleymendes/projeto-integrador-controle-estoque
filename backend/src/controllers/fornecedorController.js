const db = require('../database');
const { lerId, validarFornecedor } = require('../validacoes');

const colunas = 'id, nome, cnpj, endereco, telefone, email, contato_principal AS contatoPrincipal';

function buscar(id) {
  return db.prepare(`SELECT ${colunas} FROM fornecedores WHERE id = ?`).get(id);
}

function listar(req, res) {
  const fornecedores = db.prepare(`SELECT ${colunas} FROM fornecedores ORDER BY nome`).all();
  res.json(fornecedores);
}

function buscarPorId(req, res) {
  const fornecedor = buscar(lerId(req.params.id));
  if (!fornecedor) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });
  }
  res.json(fornecedor);
}

function criar(req, res) {
  const { erros, dados } = validarFornecedor(req.body ?? {});
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ mensagem: 'Verifique os campos informados', erros });
  }

  const existente = db.prepare('SELECT id FROM fornecedores WHERE cnpj = ?').get(dados.cnpj);
  if (existente) {
    return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  const resultado = db
    .prepare(
      `INSERT INTO fornecedores (nome, cnpj, endereco, telefone, email, contato_principal)
       VALUES (@nome, @cnpj, @endereco, @telefone, @email, @contatoPrincipal)`
    )
    .run(dados);

  res.status(201).json({
    mensagem: 'Fornecedor cadastrado com sucesso!',
    fornecedor: buscar(resultado.lastInsertRowid),
  });
}

function atualizar(req, res) {
  const id = lerId(req.params.id);
  if (!id || !buscar(id)) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });
  }

  const { erros, dados } = validarFornecedor(req.body ?? {});
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ mensagem: 'Verifique os campos informados', erros });
  }

  const outro = db.prepare('SELECT id FROM fornecedores WHERE cnpj = ? AND id <> ?').get(dados.cnpj, id);
  if (outro) {
    return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  db.prepare(
    `UPDATE fornecedores
     SET nome = @nome, cnpj = @cnpj, endereco = @endereco, telefone = @telefone,
         email = @email, contato_principal = @contatoPrincipal
     WHERE id = @id`
  ).run({ ...dados, id });

  res.json({ mensagem: 'Fornecedor atualizado com sucesso!', fornecedor: buscar(id) });
}

function excluir(req, res) {
  const id = lerId(req.params.id);
  if (!id || !buscar(id)) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });
  }

  db.prepare('DELETE FROM fornecedores WHERE id = ?').run(id);
  res.json({ mensagem: 'Fornecedor excluído com sucesso!' });
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
