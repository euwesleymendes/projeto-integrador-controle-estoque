const fs = require('fs');
const path = require('path');
const db = require('../database');
const { pastaUploads } = require('../upload');
const { lerId, validarProduto } = require('../validacoes');
const { fornecedoresDoProduto } = require('./associacaoController');

const colunas = `id, nome, codigo_barras AS codigoBarras, descricao,
  quantidade_estoque AS quantidadeEstoque, categoria,
  data_validade AS dataValidade, imagem, preco_custo AS precoCusto`;

const categorias = ['Eletrônicos', 'Alimentos', 'Bebidas', 'Vestuário', 'Higiene e Limpeza', 'Papelaria', 'Outro'];

function buscar(id) {
  return db.prepare(`SELECT ${colunas} FROM produtos WHERE id = ?`).get(id);
}

function descartarUpload(req) {
  if (req.file) fs.unlink(req.file.path, () => {});
}

function apagarImagem(caminhoPublico) {
  if (!caminhoPublico) return;
  fs.unlink(path.join(pastaUploads, path.basename(caminhoPublico)), () => {});
}

function listarCategorias(req, res) {
  res.json(categorias);
}

function listar(req, res) {
  const produtos = db.prepare(`SELECT ${colunas} FROM produtos ORDER BY nome`).all();
  res.json(produtos);
}

function buscarPorId(req, res) {
  const id = lerId(req.params.id);
  const produto = id && buscar(id);
  if (!produto) {
    return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  }
  res.json({ ...produto, fornecedores: fornecedoresDoProduto(id) });
}

function criar(req, res) {
  const { erros, dados } = validarProduto(req.body ?? {});
  if (Object.keys(erros).length > 0) {
    descartarUpload(req);
    return res.status(400).json({ mensagem: 'Verifique os campos informados', erros });
  }

  const existente = db.prepare('SELECT id FROM produtos WHERE codigo_barras = ?').get(dados.codigoBarras);
  if (existente) {
    descartarUpload(req);
    return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
  }

  const imagem = req.file ? `/uploads/${req.file.filename}` : null;
  const resultado = db
    .prepare(
      `INSERT INTO produtos (nome, codigo_barras, descricao, quantidade_estoque, categoria, data_validade, imagem, preco_custo)
       VALUES (@nome, @codigoBarras, @descricao, @quantidadeEstoque, @categoria, @dataValidade, @imagem, @precoCusto)`
    )
    .run({ ...dados, imagem });

  res.status(201).json({
    mensagem: 'Produto cadastrado com sucesso!',
    produto: buscar(resultado.lastInsertRowid),
  });
}

function atualizar(req, res) {
  const id = lerId(req.params.id);
  const atual = id && buscar(id);
  if (!atual) {
    descartarUpload(req);
    return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  }

  const { erros, dados } = validarProduto(req.body ?? {});
  if (Object.keys(erros).length > 0) {
    descartarUpload(req);
    return res.status(400).json({ mensagem: 'Verifique os campos informados', erros });
  }

  const outro = db.prepare('SELECT id FROM produtos WHERE codigo_barras = ? AND id <> ?').get(dados.codigoBarras, id);
  if (outro) {
    descartarUpload(req);
    return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
  }

  const imagem = req.file ? `/uploads/${req.file.filename}` : atual.imagem;
  db.prepare(
    `UPDATE produtos
     SET nome = @nome, codigo_barras = @codigoBarras, descricao = @descricao,
         quantidade_estoque = @quantidadeEstoque, categoria = @categoria,
         data_validade = @dataValidade, imagem = @imagem, preco_custo = @precoCusto
     WHERE id = @id`
  ).run({ ...dados, imagem, id });

  if (req.file) apagarImagem(atual.imagem);

  res.json({ mensagem: 'Produto atualizado com sucesso!', produto: buscar(id) });
}

function excluir(req, res) {
  const id = lerId(req.params.id);
  const atual = id && buscar(id);
  if (!atual) {
    return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  }

  db.prepare('DELETE FROM produtos WHERE id = ?').run(id);
  apagarImagem(atual.imagem);

  res.json({ mensagem: 'Produto excluído com sucesso!' });
}

module.exports = { listarCategorias, listar, buscarPorId, criar, atualizar, excluir };
