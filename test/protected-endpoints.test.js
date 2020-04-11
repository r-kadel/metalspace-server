const knex = require('knex');
const app = require('../src/app');
const {
  makeUsers,
  cleanTable,
  makeResults,
  makeAuthHeader
} = require('./test-helpers');

describe.only('Protected endpoints', function() {
  let db;

  const testUsers = makeUsers();
  const testUser = testUsers[1];
  const testResults = makeResults();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => cleanTable(db));

  afterEach('cleanup', () => cleanTable(db));

  const protectedEndpoints = [
    {
      name: 'GET /api/search/:search_id/',
      path: '/api/search/bojack/',
      method: supertest(app).get
    }
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return endpoint
          .method(endpoint.path)
          .set('Authorization', makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'user-not-existy', id: 1 };
        return endpoint
          .method(endpoint.path)
          .set('Authorization', makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 200 and gets results with valid credentials`, () => {
        const validUser = testUsers[1];
        return endpoint
          .method(endpoint.path)
          .set('Authorization', makeAuthHeader(validUser))
          .expect(200, testResults);
      });
    });
  });
});