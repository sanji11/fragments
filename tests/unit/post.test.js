// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('POST /v1/fragments', () => {
  // authenticated vs unauthenticated requests (use HTTP Basic Auth, don't worry about Cognito in tests)
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // authenticated users can create a plain text fragment
  test('authenticated user can create a text/plain fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');

    // Get the fragment metadata record for the data
    const testFragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
    expect(res.body.fragment).toEqual(testFragment);
    // responses include a Location header with a URL to GET the fragment
    const apiUrl = process.env.API_URL;
    const fullURL = apiUrl + '/v1/fragments/' + testFragment.id;
    expect(res.headers.location).toEqual(fullURL);
  });

  // authenticated users can create a text/plain; charset=utf-8 fragment
  test('authenticated users can create a text/plain; charset=utf-8 fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain; charset=utf-8');

    // Get the fragment metadata record for the data
    const testFragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
    expect(res.body.fragment).toEqual(testFragment);
    // responses include a Location header with a URL to GET the fragment
    const apiUrl = process.env.API_URL;
    const fullURL = apiUrl + '/v1/fragments/' + testFragment.id;
    expect(res.headers.location).toEqual(fullURL);
  });

  // authenticated users can create a text/markdown fragment
  test('authenticated users can create a text/markdown fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/markdown');

    // Get the fragment metadata record for the data
    const testFragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
    expect(res.body.fragment).toEqual(testFragment);
    // responses include a Location header with a URL to GET the fragment
    const apiUrl = process.env.API_URL;
    const fullURL = apiUrl + '/v1/fragments/' + testFragment.id;
    expect(res.headers.location).toEqual(fullURL);
  });

  // authenticated users can create a text/html fragment
  test('authenticated users can create a text/html fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/html');

    // Get the fragment metadata record for the data
    const testFragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
    expect(res.body.fragment).toEqual(testFragment);
    // responses include a Location header with a URL to GET the fragment
    const apiUrl = process.env.API_URL;
    const fullURL = apiUrl + '/v1/fragments/' + testFragment.id;
    expect(res.headers.location).toEqual(fullURL);
  });

  // authenticated users can create an application/json fragment
  test('authenticated users can create an application/json fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'application/json');

    // Get the fragment metadata record for the data
    const testFragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
    expect(res.body.fragment).toEqual(testFragment);
    // responses include a Location header with a URL to GET the fragment
    const apiUrl = process.env.API_URL;
    const fullURL = apiUrl + '/v1/fragments/' + testFragment.id;
    expect(res.headers.location).toEqual(fullURL);
  });

  // trying to create a fragment with an unsupported type throws error as expected
  test('unsupported type throws 415 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'image/png');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toEqual('unsupported fragment type; got type=image/png');
  });
});
