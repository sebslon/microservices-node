import { OrderCancelledEvent, Publisher, Subjects } from '@msvcs/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
