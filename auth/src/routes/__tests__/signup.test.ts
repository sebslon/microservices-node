import request from 'supertest';

import { app } from '../../app';

describe('signup route handler', () => {
  it('Returns a 201 on a successful signup', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);
  });

  it('Returns a 400 with an invalid email', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'testtest.com',
        password: 'password',
      })
      .expect(400);
  });

  it('Returns a 400 with an invalid password', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'p',
      })
      .expect(400);
  });

  it('Returns a 400 with missing email and password', async () => {
    return request(app).post('/api/users/signup').send({}).expect(400);
  });

  it('Disallows duplicate emails', async () => {
    await request(app).post('/api/users/signup').send({
      email: 'test@test.com',
      password: 'password',
    });

    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(400);
  });

  it('Sets a cookie after successful signup', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
