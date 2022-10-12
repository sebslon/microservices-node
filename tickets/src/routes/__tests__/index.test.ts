import request from 'supertest';

import { app } from '../../app';
import { AuthTestHelper } from '../../tests-configs/auth-test-helper';

const createTicket = async (title: string, price: number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', await AuthTestHelper.signin())
    .send({
      title,
      price,
    });
};

describe('Index tickets', () => {
  it('Can fetch a list of tickets', async () => {
    await createTicket('concert', 20);
    await createTicket('concert', 20);
    await createTicket('concert', 20);

    const response = await request(app).get('/api/tickets').send().expect(200);

    expect(response.body.length).toEqual(3);
  });
});
