const express = require('express');
const OrderController = require('../controllers/orderController');
const OrderService = require('../services/orderService');
const orderRepository = require('../repositories/orderRepositorySqlite');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Aplica JWT em todos os endpoints de pedidos
router.use(authMiddleware);

const orderService = new OrderService(orderRepository);
const controller = new OrderController(orderService);

// Criar novo pedido
router.post('/', controller.create);

// Obter pedido por id
router.get('/:orderId', controller.getById);

// Listar todos
router.get('/list/all', controller.list);

// Atualizar pedido
router.put('/:orderId', controller.update);

// Deletar pedido
router.delete('/:orderId', controller.remove);

module.exports = router;
