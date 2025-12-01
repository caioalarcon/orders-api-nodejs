const { toInternalOrder } = require('../models/mappers');

class OrderService {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async createOrder(externalJson) {
    const internal = toInternalOrder(externalJson);
    return this.orderRepository.createOrder(internal);
  }

  async getOrder(orderId) {
    return this.orderRepository.findById(orderId);
  }

  async listOrders() {
    return this.orderRepository.findAll();
  }

  async updateOrder(orderId, externalJson) {
    const internal = toInternalOrder(externalJson);

    if (internal.orderId !== String(orderId)) {
      const err = new Error('numeroPedido do corpo precisa ser igual ao parâmetro');
      err.status = 400;
      throw err;
    }

    return this.orderRepository.updateOrder(orderId, internal);
  }

  async deleteOrder(orderId) {
    return this.orderRepository.deleteOrder(orderId);
  }
}

module.exports = OrderService;
