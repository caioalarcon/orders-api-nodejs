const db = require('../config/db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function createOrder(order) {
  await run(
    'INSERT INTO "Order" (orderId, value, creationDate) VALUES (?, ?, ?)',
    [order.orderId, order.value, order.creationDate],
  );

  const itemInserts = order.items.map((it) =>
    run(
      'INSERT INTO Items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [order.orderId, it.productId, it.quantity, it.price],
    ),
  );
  await Promise.all(itemInserts);

  return findById(order.orderId);
}

async function findById(orderId) {
  const order = await get(
    'SELECT orderId, value, creationDate FROM "Order" WHERE orderId = ?',
    [orderId],
  );
  if (!order) return null;
  const items = await all(
    'SELECT orderId, productId, quantity, price FROM Items WHERE orderId = ?',
    [orderId],
  );
  return { order, items };
}

async function findAll({ page = 1, pageSize = 20, sortBy = 'creationDate', sortOrder = 'desc' } = {}) {
  const allowedSort = ['orderId', 'creationDate', 'value'];
  const normalizedSortBy = allowedSort.includes(sortBy) ? sortBy : 'creationDate';
  const normalizedSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * pageSize;

  const orders = await all(
    `SELECT orderId, value, creationDate FROM "Order" ORDER BY ${normalizedSortBy} ${normalizedSortOrder} LIMIT ? OFFSET ?`,
    [pageSize, offset],
  );
  const results = [];
  for (const o of orders) {
    const items = await all(
      'SELECT orderId, productId, quantity, price FROM Items WHERE orderId = ?',
      [o.orderId],
    );
    results.push({ order: o, items });
  }

  const totalRow = await get('SELECT COUNT(*) as total FROM "Order"');

  return {
    data: results,
    total: totalRow?.total || 0,
    sort: { sortBy: normalizedSortBy, sortOrder: normalizedSortOrder.toLowerCase() },
  };
}

async function updateOrder(orderId, order) {
  await run(
    'UPDATE "Order" SET value = ?, creationDate = ? WHERE orderId = ?',
    [order.value, order.creationDate, orderId],
  );
  await run('DELETE FROM Items WHERE orderId = ?', [orderId]);
  const itemInserts = order.items.map((it) =>
    run(
      'INSERT INTO Items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, it.productId, it.quantity, it.price],
    ),
  );
  await Promise.all(itemInserts);
  return findById(orderId);
}

async function deleteOrder(orderId) {
  await run('DELETE FROM Items WHERE orderId = ?', [orderId]);
  const res = await run('DELETE FROM "Order" WHERE orderId = ?', [orderId]);
  return res.changes > 0;
}

module.exports = {
  createOrder,
  findById,
  findAll,
  updateOrder,
  deleteOrder,
};
