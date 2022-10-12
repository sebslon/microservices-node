import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@msvcs/common';

import { app } from '../../app';
import { stripe } from '../../stripe';

import { AuthTestHelper } from '../../tests-configs/auth-test-helper';

import { Order } from '../../models/order';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

describe('New payment route', () => {
  it('Returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
      .post('/api/payments')
      .set('Cookie', await AuthTestHelper.signin())
      .send({
        token: 'asdf',
        orderId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it("Returns a 401 when purchasing an order that doesn't belong to the user", async () => {
    const order = await Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 20,
      status: OrderStatus.Created,
    }).save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', await AuthTestHelper.signin())
      .send({
        token: 'asdf',
        orderId: order.id,
      })
      .expect(401);
  });

  it('Returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = await Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Cancelled,
    }).save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', await AuthTestHelper.signin(userId))
      .send({
        token: 'asdf',
        orderId: order.id,
      })
      .expect(400);
  });

  it('Returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = await Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Created,
    }).save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', await AuthTestHelper.signin(userId))
      .send({
        token: 'tok_visa',
        orderId: order.id,
      })
      .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual('usd');

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: 'test',
    });

    expect(payment).not.toBeNull();
  });
});
