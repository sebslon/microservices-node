import request from 'supertest';

import { app } from '../../app';

import { AuthTestHelper } from '../../tests-configs/auth-test-helper';

describe('current-user route handler', () => {
  it('responds with details about the current user', async () => {
    const cookie = await AuthTestHelper.signin();

    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
  });

  it('responds with null if not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .send()
      .expect(200);

    expect(response.body.currentUser).toEqual(null);
  });
});
