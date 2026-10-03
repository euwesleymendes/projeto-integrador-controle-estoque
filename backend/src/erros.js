function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
}

function tratarErros(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      mensagem: 'Verifique os campos informados',
      erros: { imagem: 'A imagem deve ter no máximo 2 MB' },
    });
  }

  if (err.code === 'IMAGEM_INVALIDA' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      mensagem: 'Verifique os campos informados',
      erros: { imagem: 'Envie um arquivo de imagem no campo "imagem"' },
    });
  }

  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno no servidor' });
}

module.exports = { rotaNaoEncontrada, tratarErros };
