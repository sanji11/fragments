// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a fragments array
  test('authenticated users get a fragments array', async () => {
    // Create a test fragment
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');

    // Get the fragments metadata record for the current user (non-expanded version)
    const fragments = await Fragment.byUser(postResponse.body.fragment.ownerId, false);

    // Call get /fragments to get all fragments of current user (just fragments' id)
    const res = await request(app).get('/v1/fragments').auth('john@email.com', 'test@23');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toEqual(fragments);
  });

  // Using a valid username/password pair should give a success result with a fragments array with a full representations of the fragments' metadata
  test('authenticated users get a fragments array with full fragments metadata', async () => {
    // Create a test fragment
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');

    // Get the fragments metadata record for the current user (expanded version)
    const fragments = await Fragment.byUser(postResponse.body.fragment.ownerId, true);

    // Call get /fragments to get all fragments of current user (full metadata)
    const res = await request(app).get('/v1/fragments?expand=1').auth('john@email.com', 'test@23');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toEqual(fragments);
  });
});
