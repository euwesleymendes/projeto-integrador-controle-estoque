const express = require('express');
const cors = require('cors');
const { pastaUploads } = require('./src/upload');
const rotas = require('./src/routes');
const { rotaNaoEncontrada, tratarErros } = require('./src/erros');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(pastaUploads));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de controle de estoque funcionando' });
});

app.use(rotas);
app.use(rotaNaoEncontrada);
app.use(tratarErros);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
