import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// kubectl port-forward <pod_name> <port_mapping> (SETUP FOR NATS SERVER IN KUBERNETES TO BE ACCESSIBLE LOCALLY)
// http://localhost:8222/streaming

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222', // client
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit(); // Graceful shutdown - don't accept any new requests / avoid hanging messages
  });

  new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close()); // Graceful shutdown
process.on('SIGTERM', () => stan.close()); // Graceful shutdown + heartbeat
