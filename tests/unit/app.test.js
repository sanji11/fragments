// tests/unit/app.test.js

const request = require('supertest');

// Get our Express app object (we don't need the server part)
const app = require('../../src/app');

describe('Default error handler', () => {
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/error');
    expect(res.statusCode).toBe(404);
  });

  test('should return status: error in response', async () => {
    const res = await request(app).get('/error');
    expect(res.body.status).toEqual('error');
  });

  test('should return 404 code and a message in response', async () => {
    const res = await request(app).get('/error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toEqual('not found');
  });
});
