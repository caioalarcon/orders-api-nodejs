const { toResponseOrder } = require('../models/mappers');

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;

    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async create(req, res, next) {
    try {
      const created = await this.orderService.createOrder(req.body);
      return res.status(201).json(toResponseOrder(created.order, created.items));
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { orderId } = req.params;
      const found = await this.orderService.getOrder(orderId);
      if (!found) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      return res.status(200).json(toResponseOrder(found.order, found.items));
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const orders = await this.orderService.listOrders();
      const response = orders.map((o) => toResponseOrder(o.order, o.items));
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { orderId } = req.params;
      const updated = await this.orderService.updateOrder(orderId, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      return res.status(200).json(toResponseOrder(updated.order, updated.items));
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const { orderId } = req.params;
      const deleted = await this.orderService.deleteOrder(orderId);
      if (!deleted) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
