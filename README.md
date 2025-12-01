# Orders API (Node.js + Express + SQLite + JWT)

API simples para gerenciamento de pedidos, com autenticação via JWT, mapeamento de campos e integração com SQLite.

## Requisitos

- Node.js >= 18
- npm
- (Opcional) `curl` ou Postman/Insomnia

## Instalação

```bash
npm install
```

## Inicializar o banco de dados

Cria as tabelas `Order` e `Items` e popula um pedido de exemplo:

```bash
npm run init-db
```

O arquivo do banco (`orders.db`) ficará na raiz do projeto.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (opcional):

```bash
PORT=3000
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=1h
DB_PATH=./orders.db
```

## Rodar a aplicação

```bash
npm start
```

Servidor em: `http://localhost:3000`.

Verificação rápida:

```bash
curl http://localhost:3000/health
```

## Fluxo básico de uso

### 1. Login (obter JWT)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "admin", "password": "admin" }'
```

Resposta:

```json
{
  "token": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": "1h"
}
```

Guarde o valor de `token`.

### 2. Criar pedido

```bash
TOKEN="<JWT_AQUI>"

curl --location 'http://localhost:3000/order' \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 1,
        "valorItem": 1000
      }
    ]
  }'
```

A API converte para o formato interno:

```json
{
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

### 3. Buscar pedido por ID

```bash
curl http://localhost:3000/order/v10089015vdb-01 \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Listar todos os pedidos

```bash
curl http://localhost:3000/order/list/all \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Atualizar pedido

```bash
curl -X PUT http://localhost:3000/order/v10089015vdb-01 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 15000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 2,
        "valorItem": 7500
      }
    ]
  }'
```

### 6. Remover pedido

```bash
curl -X DELETE http://localhost:3000/order/v10089015vdb-01 \
  -H "Authorization: Bearer $TOKEN"
```

## Testes

Os testes unitários usam repositório em memória, sem depender do banco.

```bash
npm test
```

- `tests/orderService.test.js`: testa mapeamento e regras do serviço.
- `tests/authAndOrderEndpoints.test.js`: testa os endpoints com JWT e repositório em memória.

## OpenAPI

O contrato da API está em `openapi.yaml`. Pode ser aberto em ferramentas como Swagger UI ou Insomnia.

## Estrutura do projeto (resumo)

- `src/app.js` — configuração do Express.
- `src/server.js` — bootstrap do servidor.
- `src/routes/*` — rotas de autenticação e pedidos.
- `src/controllers/*` — lógica de entrada/saída HTTP.
- `src/services/orderService.js` — regras de negócio de pedidos.
- `src/repositories/*` — acesso a dados (SQLite e memória).
- `src/models/mappers.js` — mapeamento de JSON externo ↔ interno.
- `scripts/*` — scripts SQL e inicialização do banco.
- `tests/*` — testes unitários com Jest.
