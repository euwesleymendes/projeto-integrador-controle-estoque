const db = require('../database');
const { lerId } = require('../validacoes');

function fornecedoresDoProduto(produtoId) {
  return db
    .prepare(
      `SELECT f.id, f.nome, f.cnpj
       FROM fornecedores f
       JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
       WHERE pf.produto_id = ?
       ORDER BY f.nome`
    )
    .all(produtoId);
}

function produtoExiste(id) {
  return db.prepare('SELECT id FROM produtos WHERE id = ?').get(id);
}

function fornecedorExiste(id) {
  return db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(id);
}

function listarFornecedoresDoProduto(req, res) {
  const produtoId = lerId(req.params.id);
  if (!produtoId || !produtoExiste(produtoId)) {
    return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  }
  res.json(fornecedoresDoProduto(produtoId));
}

function listarProdutosDoFornecedor(req, res) {
  const fornecedorId = lerId(req.params.id);
  if (!fornecedorId || !fornecedorExiste(fornecedorId)) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });
  }

  const produtos = db
    .prepare(
      `SELECT p.id, p.nome, p.codigo_barras AS codigoBarras
       FROM produtos p
       JOIN produto_fornecedor pf ON pf.produto_id = p.id
       WHERE pf.fornecedor_id = ?
       ORDER BY p.nome`
    )
    .all(fornecedorId);

  res.json(produtos);
}

function associar(req, res) {
  const produtoId = lerId(req.params.id);
  if (!produtoId || !produtoExiste(produtoId)) {
    return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  }

  const fornecedorId = lerId((req.body ?? {}).fornecedorId);
  if (!fornecedorId) {
    return res.status(400).json({
      mensagem: 'Verifique os campos informados',
      erros: { fornecedorId: 'Selecione um fornecedor' },
    });
  }
  if (!fornecedorExiste(fornecedorId)) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });
  }

  const jaAssociado = db
    .prepare('SELECT 1 FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
    .get(produtoId, fornecedorId);
  if (jaAssociado) {
    return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });
  }

  db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)').run(produtoId, fornecedorId);

  res.status(201).json({
    mensagem: 'Fornecedor associado com sucesso ao produto!',
    fornecedores: fornecedoresDoProduto(produtoId),
  });
}

function desassociar(req, res) {
  const produtoId = lerId(req.params.id);
  const fornecedorId = lerId(req.params.fornecedorId);
  if (!produtoId || !produtoExiste(produtoId)) {
    return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  }

  const resultado = fornecedorId
    ? db.prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?').run(produtoId, fornecedorId)
    : { changes: 0 };
  if (resultado.changes === 0) {
    return res.status(404).json({ mensagem: 'Este fornecedor não está associado ao produto.' });
  }

  res.json({
    mensagem: 'Fornecedor desassociado com sucesso!',
    fornecedores: fornecedoresDoProduto(produtoId),
  });
}

module.exports = {
  fornecedoresDoProduto,
  listarFornecedoresDoProduto,
  listarProdutosDoFornecedor,
  associar,
  desassociar,
};
