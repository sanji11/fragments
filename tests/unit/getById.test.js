// tests/unit/getById.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET BY ID /v1/fragments/:id', () => {
  // authenticated vs unauthenticated requests (use HTTP Basic Auth, don't worry about Cognito in tests)
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/:id').expect(401));

  //authenticated user with wrong fragment id throws 404 error
  test('Unknown fragment ID with authenticated users does not exist', async () => {
    const id = '12abc34';
    await request(app).get(`/v1/fragments/${id}`).auth('john@email.com', 'test@23').expect(404);
  });

  //authenticated user with correct fragment ID can get the fragment
  test('authenticated user with correct fragment ID can get the fragment', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');
    // Get the fragment metadata record for the data
    const fragment = await Fragment.byId(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );
    const getResponse = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('john@email.com', 'test@23')
      .expect(200);
    //Match the fragment text that sent
    expect(getResponse.text).toEqual('Testing text fragment');
  });

  //authenticated user with correct fragment ID with unsupported type/extension throws 415 error
  test('authenticated user with correct fragment ID with unsupported type/extension throws 415 error', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');
    // Get the fragment metadata record for the data
    const fragment = await Fragment.byId(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );
    // Unsupported type - text/csv (.csv) throws an error
    const getResponse = await request(app)
      .get(`/v1/fragments/${fragment.id}.csv`)
      .auth('john@email.com', 'test@23')
      .expect(415);
    expect(getResponse.body.status).toBe('error');
    expect(getResponse.body.error.message).toEqual(
      'Unable to convert fragment; got extension type=text/csv and fragment original type=text/plain'
    );
  });

  //authenticated user with correct fragment ID with supported type/extension can get the fragment
  test('authenticated user with correct fragment ID with supported type/extension can get the fragment', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');
    // Get the fragment metadata record for the data
    const fragment = await Fragment.byId(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );
    // One of the supported type is .txt
    const getResponse = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth('john@email.com', 'test@23')
      .expect(200);
    //Match the fragment text that sent
    expect(getResponse.text).toEqual('Testing text fragment');
  });

  //authenticated user with correct fragment ID with unable to convert fragment throws 415 error
  test('authenticated user with correct fragment ID with unable to convert fragment throws 415 error', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');
    // Get the fragment metadata record for the data
    const fragment = await Fragment.byId(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );
    // Unsupported conversion .txt to .md throws an error
    const getResponse = await request(app)
      .get(`/v1/fragments/${fragment.id}.md`)
      .auth('john@email.com', 'test@23')
      .expect(415);
    expect(getResponse.body.status).toBe('error');
    expect(getResponse.body.error.message).toEqual(
      'Unable to convert fragment; got extension type=text/markdown and fragment original type=text/plain'
    );
  });

  //authenticated user with correct fragment ID can convert text/markdown to text/html
  test('authenticated user with correct fragment ID can convert text/markdown to text/html', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('# Testing text fragment')
      .set('Content-type', 'text/markdown');
    // Get the fragment metadata record for the data
    const fragment = await Fragment.byId(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );
    // Only supported conversion is from text/markdown to text/html
    await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth('john@email.com', 'test@23')
      .expect(200);
  });
});
