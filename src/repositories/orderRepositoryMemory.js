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

  async findAll() {
    return Array.from(this.orders.values()).map((v) => ({
      order: { ...v.order },
      items: v.items.map((it) => ({ ...it })),
    }));
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
