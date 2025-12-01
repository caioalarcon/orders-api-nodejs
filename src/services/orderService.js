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

  async listOrders(options) {
    return this.orderRepository.findAll(options);
  }

  async updateOrder(orderId, externalJson) {
    const internal = toInternalOrder(externalJson);
    return this.orderRepository.updateOrder(orderId, internal);
  }

  async deleteOrder(orderId) {
    return this.orderRepository.deleteOrder(orderId);
  }
}

module.exports = OrderService;
