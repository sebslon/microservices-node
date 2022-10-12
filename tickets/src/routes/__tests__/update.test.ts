import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { AuthTestHelper } from '../../tests-configs/auth-test-helper';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

describe('Update ticket', () => {
  it('Returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', await AuthTestHelper.signin())
      .send({ title: 'concert', price: 20 })
      .expect(404);
  });

  it('Returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .send({ title: 'concert', price: 20 })
      .expect(401);
  });

  it('Returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', await AuthTestHelper.signin())
      .send({ title: 'concert', price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', await AuthTestHelper.signin())
      .send({ title: 'new concert', price: 100 })
      .expect(401);
  });

  it('Returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = await AuthTestHelper.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'concert', price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: '', price: 100 })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'new concert', price: -10 })
      .expect(400);
  });

  it('Updates the ticket provided valid inputs', async () => {
    const cookie = await AuthTestHelper.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'concert', price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'new concert', price: 100 })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();

    expect(ticketResponse.body.title).toEqual('new concert');
    expect(ticketResponse.body.price).toEqual(100);
  });

  it('Publishes an event when ticket is updated', async () => {
    const cookie = await AuthTestHelper.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'concert', price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'new concert', price: 100 })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('Rejects updates if the ticket is reserved', async () => {
    const cookie = await AuthTestHelper.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'concert', price: 20 });

    const ticket = await Ticket.findById(response.body.id);
    const orderId = new mongoose.Types.ObjectId().toHexString();

    ticket!.set({ orderId });

    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'new concert', price: 100 })
      .expect(400);
  });
});
