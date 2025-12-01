const request = require('supertest');
const createApp = require('../src/app');
const InMemoryOrderRepository = require('../src/repositories/orderRepositoryMemory');
const OrderService = require('../src/services/orderService');
const OrderController = require('../src/controllers/orderController');
const authMiddleware = require('../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config/jwt');

jest.mock('../src/routes/orderRoutes', () => {
  const express = require('express');
  const router = express.Router();
  const InMemoryOrderRepository = require('../src/repositories/orderRepositoryMemory');
  const OrderService = require('../src/services/orderService');
  const OrderController = require('../src/controllers/orderController');
  const authMiddleware = require('../src/middleware/authMiddleware');

  const repo = new InMemoryOrderRepository();
  const service = new OrderService(repo);
  const controller = new OrderController(service);

  router.use(authMiddleware);

  router.post('/', controller.create);
  router.get('/:orderId', controller.getById);
  router.get('/list/all', controller.list);
  router.put('/:orderId', controller.update);
  router.delete('/:orderId', controller.remove);

  return router;
});

describe('Auth + Orders endpoints (with in-memory repo)', () => {
  let app;
  let token;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    token = jwt.sign({ sub: 'admin' }, jwtSecret, { expiresIn: '1h' });
  });

  it('should login and return a JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(200);

    expect(res.body.token).toBeDefined();
  });

  it('should reject orders without token', async () => {
    await request(app)
      .get('/order/list/all')
      .expect(401);
  });

  it('should create and fetch an order using the API', async () => {
    const external = {
      numeroPedido: 'api-order-01',
      valorTotal: 9000,
      dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
      items: [
        { idItem: '2434', quantidadeItem: 1, valorItem: 1000 },
      ],
    };

    const createRes = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send(external)
      .expect(201);

    expect(createRes.body.orderId).toBe('api-order-01');
    expect(createRes.body.items[0].productId).toBe(2434);

    const getRes = await request(app)
      .get('/order/api-order-01')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.value).toBe(9000);
  });
});
