import mongoose from 'mongoose';
import { ExpirationCompleteEvent } from '@msvcs/common';

import { natsWrapper } from '../../../nats-wrapper';

import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  }).save();

  const order = await Order.build({
    status: OrderStatus.Created,
    userId: 'asdf',
    expiresAt: new Date(),
    ticket,
  }).save();

  // Create a fake data event
  const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, order, ticket, data, msg };
};

describe('Expiration Complete Listener', () => {
  it('Updates the order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('Emits an Order Cancelled event', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(eventData.id).toEqual(order.id);
  });

  it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
