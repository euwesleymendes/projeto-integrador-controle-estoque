FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)

Projeto Disciplina Projeto Integrador

## Sobre o projeto

Sistema de controle de estoque feito para o Projeto Integrador. Dá para cadastrar produtos e fornecedores e associar um fornecedor a um produto (um produto pode ter vários fornecedores e um fornecedor pode ter vários produtos).

Por enquanto só o backend está pronto, feito em Node.js com Express e SQLite. O frontend em React vai ficar na pasta `frontend`.

## Como rodar o backend

Precisa do Node.js instalado (versão 22 ou mais nova).

```
cd backend
npm install
npm start
```

A API sobe em http://localhost:3000. O banco SQLite é criado sozinho na pasta `backend/data` na primeira execução.

## Como testar

Na pasta `backend/docs` tem a coleção `estoque.postman_collection.json`, que dá para importar no Postman ou no Insomnia. Ela já traz as chamadas de fornecedor, produto e associação, incluindo os casos de erro (CNPJ repetido, código de barras repetido, dados inválidos e fornecedor já associado).

As mensagens de sucesso e de erro seguem as histórias do projeto, por exemplo "Fornecedor cadastrado com sucesso!" e "Fornecedor já está associado a este produto!".

## Rotas principais

| Rota | O que faz |
|---|---|
| `POST /fornecedores` | cadastra fornecedor |
| `POST /produtos` | cadastra produto (aceita JSON ou form-data com imagem) |
| `POST /produtos/:id/fornecedores` | associa um fornecedor ao produto (`{ "fornecedorId": 1 }`) |
| `DELETE /produtos/:id/fornecedores/:fornecedorId` | desassocia |
| `GET /produtos/:id/fornecedores` | fornecedores de um produto |
| `GET /fornecedores/:id/produtos` | produtos de um fornecedor |

Produtos e fornecedores também têm listar, buscar por id, editar (`PUT`) e excluir (`DELETE`). `GET /categorias` devolve as categorias para o formulário.
