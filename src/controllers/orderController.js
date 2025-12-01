const { toResponseOrder } = require('../models/mappers');
const logger = require('../config/logger');

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
      const {
        page = '1',
        pageSize = '20',
        sortBy = 'creationDate',
        sortOrder = 'desc',
      } = req.query;

      const options = {
        page: Math.max(parseInt(page, 10) || 1, 1),
        pageSize: Math.max(parseInt(pageSize, 10) || 20, 1),
        sortBy,
        sortOrder,
      };

      const { data, total, sort } = await this.orderService.listOrders(options);
      const response = data.map((o) => toResponseOrder(o.order, o.items));
      return res.status(200).json({
        data: response,
        pagination: {
          total,
          page: options.page,
          pageSize: options.pageSize,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { orderId } = req.params;
      if (req.body.numeroPedido && req.body.numeroPedido !== orderId) {
        logger.warn({
          orderId,
          bodyOrderId: req.body.numeroPedido,
        }, 'Order id mismatch on update request');
        return res
          .status(400)
          .json({ message: 'numeroPedido deve ser igual ao parâmetro orderId' });
      }

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
