import { Publisher, Subjects, TicketUpdatedEvent } from '@msvcs/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
