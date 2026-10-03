const express = require('express');
const { upload } = require('./upload');
const produtos = require('./controllers/produtoController');
const fornecedores = require('./controllers/fornecedorController');
const associacoes = require('./controllers/associacaoController');

const router = express.Router();

router.get('/categorias', produtos.listarCategorias);

router.get('/fornecedores', fornecedores.listar);
router.post('/fornecedores', fornecedores.criar);
router.get('/fornecedores/:id', fornecedores.buscarPorId);
router.put('/fornecedores/:id', fornecedores.atualizar);
router.delete('/fornecedores/:id', fornecedores.excluir);
router.get('/fornecedores/:id/produtos', associacoes.listarProdutosDoFornecedor);

router.get('/produtos', produtos.listar);
router.post('/produtos', upload.single('imagem'), produtos.criar);
router.get('/produtos/:id', produtos.buscarPorId);
router.put('/produtos/:id', upload.single('imagem'), produtos.atualizar);
router.delete('/produtos/:id', produtos.excluir);

router.get('/produtos/:id/fornecedores', associacoes.listarFornecedoresDoProduto);
router.post('/produtos/:id/fornecedores', associacoes.associar);
router.delete('/produtos/:id/fornecedores/:fornecedorId', associacoes.desassociar);

module.exports = router;
