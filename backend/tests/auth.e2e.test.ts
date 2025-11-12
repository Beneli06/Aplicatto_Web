import request from 'supertest';

import { app } from '../src/app';
import { UserModel } from '../src/models/user.model';

describe('Auth & Admin API', () => {
  const baseAuthUrl = '/api/v1/auth';
  const adminUrl = '/api/v1/admin/users';

  it('registers a new user and returns tokens', async () => {
    const response = await request(app)
      .post(`${baseAuthUrl}/register`)
      .send({
        email: 'user1@example.com',
        password: 'Password#123',
        fullName: 'User One'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      user: {
        email: 'user1@example.com',
        role: 'member',
        status: 'active'
      },
      accessToken: expect.any(String)
    });

    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('allows existing user to login', async () => {
    await request(app)
      .post(`${baseAuthUrl}/register`)
      .send({
        email: 'user2@example.com',
        password: 'Password#123',
        fullName: 'User Two'
      })
      .expect(201);

    const response = await request(app)
      .post(`${baseAuthUrl}/login`)
      .send({
        email: 'user2@example.com',
        password: 'Password#123'
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
  });

  it('refreshes token using cookie value', async () => {
    const registerRes = await request(app)
      .post(`${baseAuthUrl}/register`)
      .send({ email: 'user3@example.com', password: 'Password#123' })
      .expect(201);

    const cookie = registerRes.headers['set-cookie']?.[0];
    expect(cookie).toBeDefined();

    const refreshRes = await request(app)
      .post(`${baseAuthUrl}/refresh`)
      .set('Cookie', cookie as string)
      .expect(200);

    expect(refreshRes.body.accessToken).toBeDefined();
  });

  it('prevents non-admin from accessing admin routes', async () => {
    const loginRes = await request(app)
      .post(`${baseAuthUrl}/register`)
      .send({ email: 'member@example.com', password: 'Password#123' })
      .expect(201);

    const token = loginRes.body.accessToken as string;

    await request(app)
      .get(adminUrl)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('allows admin to list users', async () => {
    const loginRes = await request(app)
      .post(`${baseAuthUrl}/login`)
      .send({ email: 'admin@aplicatto.dev', password: 'Admin#1234' })
      .expect(200);

    const token = loginRes.body.accessToken as string;

    const response = await request(app)
      .get(adminUrl)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      data: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      limit: 20
    });
  });

  it('allows admin to create and update users', async () => {
    const loginRes = await request(app)
      .post(`${baseAuthUrl}/login`)
      .send({ email: 'admin@aplicatto.dev', password: 'Admin#1234' })
      .expect(200);

    const token = loginRes.body.accessToken as string;

    const createRes = await request(app)
      .post(adminUrl)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'managed@example.com',
        password: 'Password#123',
        fullName: 'Managed User',
        role: 'member'
      })
      .expect(201);

    const userId = createRes.body.id as string;

    const updateRes = await request(app)
      .patch(`${adminUrl}/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'disabled'
      })
      .expect(200);

    expect(updateRes.body.status).toBe('disabled');

    await request(app)
      .delete(`${adminUrl}/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    expect(await UserModel.findById(userId)).toBeNull();
  });
});
