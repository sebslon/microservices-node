import { Publisher, ExpirationCompleteEvent, Subjects } from '@msvcs/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
