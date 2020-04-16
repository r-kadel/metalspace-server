const knex = require('knex');
const app = require('../src/app');
const {
  makeUsers,
  cleanTable,
  makeComments,
  makePosts,
  makeAuthHeader
} = require('./test-helpers');

describe.only('Comment endpoints', function () {
  let db;

  const testUsers = makeUsers();
  const testComments = makeComments();
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

  beforeEach('insert comments', () => {
    return db.into('metalspace_comments').insert(testComments);
  });

  describe('/GET/api/comments', () => {
    it(`responds 200 and all comments`, () => {
      return supertest(app).get('/api/comments').expect(200, [{
        user: 1,
        id: 1,
        postId: 1,
        content: "test comment",
        date_created: '2029-01-22T16:28:32.615Z'
      }]);
    });
  });

  describe('/POST/api/comments', () => {
    it(`responds with 200 when comment is made`, () => {
      const validUser = testUsers[0];
      return supertest(app)
        .post('/api/comments')
        .set('Authorization', makeAuthHeader(validUser))
        .expect(200, testComments[0]);
    });
  });
});