const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const caminhoBanco = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'estoque.sqlite');
fs.mkdirSync(path.dirname(caminhoBanco), { recursive: true });

const db = new Database(caminhoBanco);
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    contato_principal TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_barras TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    categoria TEXT NOT NULL,
    data_validade TEXT,
    imagem TEXT,
    preco_custo REAL
  );

  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
    PRIMARY KEY (produto_id, fornecedor_id)
  );
`);

module.exports = db;
