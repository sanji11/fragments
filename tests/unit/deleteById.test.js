// tests/unit/deleteById.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('DELETE BY ID /v1/fragments/:id', () => {
  // authenticated vs unauthenticated requests (use HTTP Basic Auth, don't worry about Cognito in tests)
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/:id').expect(401));

  //authenticated user tries to delete fragment that does not exist throws 404 error
  test('Unknown fragment ID with authenticated users does not exist', async () => {
    const id = '12abc34';
    await request(app).delete(`/v1/fragments/${id}`).auth('john@email.com', 'test@23').expect(404);
  });

  //authenticated user with correct fragment ID can delete the fragment
  test('authenticated user with correct fragment ID can delete the fragment', async () => {
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
    const deleteResponse = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('john@email.com', 'test@23')
      .expect(200);
    expect(deleteResponse.body.status).toBe('ok');
  });
});
