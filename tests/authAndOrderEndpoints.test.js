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

  router._repo = repo;

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
    const orderRoutes = require('../src/routes/orderRoutes');
    orderRoutes._repo.orders.clear();
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

  it('should reject updates when numeroPedido does not match route param', async () => {
    const external = {
      numeroPedido: 'api-order-02',
      valorTotal: 5000,
      dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
      items: [
        { idItem: '2434', quantidadeItem: 1, valorItem: 1000 },
      ],
    };

    await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${token}`)
      .send(external)
      .expect(201);

    const updatePayload = { ...external, numeroPedido: 'api-order-03', valorTotal: 6000 };

    const updateRes = await request(app)
      .put('/order/api-order-02')
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload)
      .expect(400);

    expect(updateRes.body.message).toMatch(/numeroPedido/);
  });

  it('should list orders with pagination metadata and sorting', async () => {
    const baseOrder = {
      valorTotal: 5000,
      dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
      items: [
        { idItem: '2434', quantidadeItem: 1, valorItem: 1000 },
      ],
    };

    const orders = [
      { ...baseOrder, numeroPedido: 'api-order-11' },
      { ...baseOrder, numeroPedido: 'api-order-12', valorTotal: 3000 },
      { ...baseOrder, numeroPedido: 'api-order-13', valorTotal: 7000 },
    ];

    for (const external of orders) {
      await request(app)
        .post('/order')
        .set('Authorization', `Bearer ${token}`)
        .send(external)
        .expect(201);
    }

    const listRes = await request(app)
      .get('/order/list/all?page=1&pageSize=2&sortBy=value&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listRes.body.pagination).toEqual(
      expect.objectContaining({
        total: 3,
        page: 1,
        pageSize: 2,
        sortBy: 'value',
        sortOrder: 'asc',
      }),
    );
    expect(listRes.body.data).toHaveLength(2);
    expect(listRes.body.data[0].value).toBe(3000);
    expect(listRes.body.data[1].value).toBe(5000);
  });
});
