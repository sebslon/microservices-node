import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { AuthTestHelper } from '../../tests-configs/auth-test-helper';

import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';

import { natsWrapper } from '../../nats-wrapper';

describe('New order router', () => {
  it('Returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
      .post('/api/orders')
      .set('Cookie', await AuthTestHelper.signin())
      .send({ ticketId })
      .expect(404);
  });

  it('Returns an error if the ticket is already reserved', async () => {
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    }).save();

    await Order.build({
      ticket,
      userId: '123',
      status: OrderStatus.Created,
      expiresAt: new Date(),
    }).save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', await AuthTestHelper.signin())
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it('Reserves a ticket', async () => {
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    }).save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', await AuthTestHelper.signin())
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it('Emits an order created event', async () => {
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    }).save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', await AuthTestHelper.signin())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
