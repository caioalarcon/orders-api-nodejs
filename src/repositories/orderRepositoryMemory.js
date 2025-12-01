/**
 * Implementação em memória usada nos testes unitários.
 */
class InMemoryOrderRepository {
  constructor() {
    this.orders = new Map(); // orderId -> { order, items }
  }

  async createOrder(order) {
    this.orders.set(order.orderId, {
      order: {
        orderId: order.orderId,
        value: order.value,
        creationDate: order.creationDate,
      },
      items: order.items.map((it) => ({ ...it })),
    });
    return this.findById(order.orderId);
  }

  async findById(orderId) {
    const data = this.orders.get(orderId);
    if (!data) return null;
    return {
      order: { ...data.order },
      items: data.items.map((it) => ({ ...it })),
    };
  }

  async findAll({ page = 1, pageSize = 20, sortBy = 'creationDate', sortOrder = 'desc' } = {}) {
    const allowedSort = ['orderId', 'creationDate', 'value'];
    const normalizedSortBy = allowedSort.includes(sortBy) ? sortBy : 'creationDate';
    const normalizedSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const allData = Array.from(this.orders.values()).map((v) => ({
      order: { ...v.order },
      items: v.items.map((it) => ({ ...it })),
    }));

    allData.sort((a, b) => {
      const aValue = a.order[normalizedSortBy];
      const bValue = b.order[normalizedSortBy];
      if (aValue === bValue) return 0;
      return normalizedSortOrder === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    const start = (page - 1) * pageSize;
    const paged = allData.slice(start, start + pageSize);

    return {
      data: paged,
      total: allData.length,
      sort: { sortBy: normalizedSortBy, sortOrder: normalizedSortOrder },
    };
  }

  async updateOrder(orderId, order) {
    if (!this.orders.has(orderId)) return null;
    this.orders.set(orderId, {
      order: {
        orderId,
        value: order.value,
        creationDate: order.creationDate,
      },
      items: order.items.map((it) => ({ ...it })),
    });
    return this.findById(orderId);
  }

  async deleteOrder(orderId) {
    return this.orders.delete(orderId);
  }
}

module.exports = InMemoryOrderRepository;
