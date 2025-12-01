/**
 * Converte o JSON externo (campos em português) para o formato interno usado no banco.
 *
 * Exemplo de entrada:
 * {
 *   numeroPedido: 'v10089015vdb-01',
 *   valorTotal: 10000,
 *   dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
 *   items: [
 *     { idItem: '2434', quantidadeItem: 1, valorItem: 1000 }
 *   ]
 * }
 */
function toInternalOrder(external) {
  if (!external) return null;

  const {
    numeroPedido,
    valorTotal,
    dataCriacao,
    items = [],
  } = external;

  if (!numeroPedido || !valorTotal || !dataCriacao) {
    const err = new Error('numeroPedido, valorTotal e dataCriacao são obrigatórios');
    err.status = 400;
    throw err;
  }

  return {
    orderId: String(numeroPedido),
    value: Number(valorTotal),
    creationDate: new Date(dataCriacao).toISOString(),
    items: items.map((it) => ({
      productId: Number(it.idItem),
      quantity: Number(it.quantidadeItem),
      price: Number(it.valorItem),
    })),
  };
}

/**
 * Converte o modelo interno (como salvo no banco) para o JSON de resposta.
 */
function toResponseOrder(orderRow, itemRows) {
  return {
    orderId: orderRow.orderId,
    value: orderRow.value,
    creationDate: orderRow.creationDate,
    items: itemRows.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      price: it.price,
    })),
  };
}

module.exports = {
  toInternalOrder,
  toResponseOrder,
};
