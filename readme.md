# Second Project

- Kubernetes for deployments - each service with its own database
- Tests setup with mongo-memory-server

## Quick overview - Ticketing App

- Users can list a ticket for an event (concert, sports) for sale
- Other users can purchase this ticket
- Any user can list tickets for sale and purchase tickets
- When an user attempts to purchase a ticket, the ticket is 'locked' for 15 minutes. The user has 15 minutes to enter their payment info.
- While locked, no other user can purchase the ticket. After 15 minutes, the ticket should 'unlock'
- Ticket prices can be edited if they are not locked

Services are created separately to manage each type of resource - for education purposes only. Perhaps 'feature-based' design would be better.

## Some of the problems & solutions in this project

```
Lots of duplicated code                               -> Central library as an NPM module to share code between our different projects
Hard to picture the flow of events between services   -> Precisely define all of our events in this shared library
Hard to remember what properties an event should have -> Write everything in TypeScript
Hard to test some event flows                         -> Write tests for as much possible/reasonable
Using too much of resources on local computer         -> Run a k8s cluster in the cloud and develop on it almost as quickly as local
Concurrency issues                                    -> Create a solutions for those
```

## Services in the project

`: service ( published events ) :`

- Auth - Everything related to user signup/signin/signout
- Tickets - Ticket creation/editing. Knows whether ticket can be updated (`ticket:created, ticket:updated`)
- Orders - Order creation/editing (`order:created, order:cancelled`)
- Expiration - Watches for oders to be created, cancels them after 15 minutes (`expiration:complete`)
- Payments - Handles credit card payments. Cancels orders if payments fails, completes if payment succeeds (`charge:created`)

<hr>

#### Some Kubernetes stuff

Creating a secret `kubectl create secret generict jwt-secret --from-literal=<key>=<value>` - `kubectl create secret generict jwt-secret --from-literal=JWT_KEY=<value>`

#### Other stuff

- Optimistic Concurrency Control (e.g. mongoose-update-if-current)
  - In case of other databases etc. more preferable approach is implementing custom version control (/orders/models/ticket.ts - commented out `$watch`)
