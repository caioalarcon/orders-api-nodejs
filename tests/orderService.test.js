const OrderService = require('../src/services/orderService');
const InMemoryOrderRepository = require('../src/repositories/orderRepositoryMemory');

describe('OrderService', () => {
  let service;

  beforeEach(() => {
    service = new OrderService(new InMemoryOrderRepository());
  });

  it('should create and retrieve an order with mapped fields', async () => {
    const external = {
      numeroPedido: 'v100-test-01',
      valorTotal: 5000,
      dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
      items: [
        { idItem: '2434', quantidadeItem: 1, valorItem: 1000 },
      ],
    };

    const created = await service.createOrder(external);
    expect(created.order.orderId).toBe('v100-test-01');
    expect(created.order.value).toBe(5000);
    expect(created.items[0].productId).toBe(2434);

    const loaded = await service.getOrder('v100-test-01');
    expect(loaded).not.toBeNull();
    expect(loaded.items[0].price).toBe(1000);
  });

  it('should throw when required fields are missing', async () => {
    await expect(
      service.createOrder({}),
    ).rejects.toHaveProperty('status', 400);
  });
});
