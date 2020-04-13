const knex = require('knex');
const app = require('../src/app');
const {
  makeUsers,
  cleanTable,
  makeAuthHeader,
  makePosts,
} = require('./test-helpers');

describe('Post endpoints', function () {
  let db;

  const testUsers = makeUsers();
  const testPosts = makePosts();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => cleanTable(db));

  afterEach('cleanup', () => cleanTable(db));

  beforeEach('inset posts', () => {
    return db.into('metalspace_posts').insert(testPosts);
  });

  describe('/GET/api/posts', () => {
    it(`responds 200 and all posts`, () => {
      return supertest(app).get('/api/posts').expect(200, testPosts);
    });
  });

  describe('/POST/api/posts', () => {
    it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
      const validUser = testUsers[0];
      const invalidSecret = 'bad-secret';
      return supertest(app)
        .post('/api/posts')
        .set('Authorization', makeAuthHeader(validUser, invalidSecret))
        .expect(401, { error: `Unauthorized request` });
    });
    it(`responds with 200 when post is made`, () => {
      const validUser = testUsers[0];
      const secret = process.env.JWT_SECRET;
      return supertest(app)
        .post('/api/posts')
        .set('Authorization', makeAuthHeader(validUser, secret))
        .expect(401, { error: `Unauthorized request` });
    });
  });
});
