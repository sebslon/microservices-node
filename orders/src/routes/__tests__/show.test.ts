import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

import { Ticket } from '../../models/ticket';
import { AuthTestHelper } from '../../tests-configs/auth-test-helper';

describe('Show order router', () => {
  it('Returns order if the user is authenticated', async () => {
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    }).save();

    const user = await AuthTestHelper.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    const response = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .expect(200);

    expect(response.body.id).toEqual(order.id);
  });

  it('Returns an error if the user is not authenticated/owner of the order', async () => {
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    }).save();

    const user = await AuthTestHelper.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', await AuthTestHelper.signin())
      .expect(401);
  });
});
