import mongoose from 'mongoose';

import { OrderCancelledListener } from '../order-cancelled-listener';

import { natsWrapper } from '../../../nats-wrapper';

import { Order } from '../../../models/order';
import { OrderCancelledEvent, OrderStatus } from '@msvcs/common';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'asdf',
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'dasdas',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

describe('Order Created Listener', () => {
  it('Replicates the order info', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.price).toEqual(order.price);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
