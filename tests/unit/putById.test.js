// tests/unit/putById.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('PUT BY ID /v1/fragments/:id', () => {
  // authenticated vs unauthenticated requests (use HTTP Basic Auth, don't worry about Cognito in tests)
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/:id').expect(401));

  //authenticated user with wrong fragment id throws 404 error
  test('Unknown fragment ID with authenticated users does not exist', async () => {
    const id = '12abc34';
    await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain')
      .expect(404);
  });

  // authenticated users with wrong type can not update the fragment
  test('authenticated user with wrong type can not update the fragment', async () => {
    // Create the fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');
    // Try to update 'text/plain' fragment with different type - 'text/markdown'
    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/markdown');

    expect(putRes.statusCode).toBe(400);
    expect(putRes.body.status).toBe('error');
    expect(putRes.body.error.message).toEqual(`Requested type does not match with fragment's type`);
  });

  // authenticated users with original type can update the fragment
  test('authenticated user with wrong type can not update the fragment', async () => {
    // Create the fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('john@email.com', 'test@23')
      .send('Testing text fragment')
      .set('Content-type', 'text/plain');
    // Update the fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('john@email.com', 'test@23')
      .send('Testing updated text fragment')
      .set('Content-type', 'text/plain');
    // Get the fragment
    const fragment = await Fragment.byId(postRes.body.fragment.ownerId, postRes.body.fragment.id);
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment).toEqual(fragment);
  });
});
