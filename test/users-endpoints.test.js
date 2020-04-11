const knex = require('knex');
const app = require('../src/app');
const { makeUsers, cleanTable } = require('./test-helpers');

describe('Users Endpoints', function() {
  let db;

  const testUsers = makeUsers();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => cleanTable(db));

  afterEach('cleanup', () => cleanTable(db));

  describe('Get /api/users', () => {
    before(() => {
      return db.into('searchstream_users').insert(testUsers);
    });

    it('responds 200 and the users list', () => {
      return supertest(app)
        .get('/api/users')
        .expect(200, testUsers);
    });
  });

  describe('POST /api/users', () => {
    const newUser = testUsers[0];

    it('responds 200 and posts the new user', () => {
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.username).to.eql(newUser.username);
          expect(res.body.email).to.eql(newUser.email);
        })
        .expect(res =>
          db
            .from('searchstream_users')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.username).to.eql(newUser.username);
              expect(row.email).to.eql(newUser.email);
            })
        );
    });
  });

  describe('DELETE /api/users', () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 5;
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } });
      });
    });

    before(() => {
      return db.into('searchstream_users').insert(testUsers);
    });

    it('responds with 204 and removes the user', () => {
      const idToRemove = 1;
      const expectedUsers = testUsers.filter(user => user.id !== idToRemove);
      return supertest(app)
        .delete(`/api/users/${idToRemove}`)
        .expect(204)
        .then(res =>
          supertest(app)
            .get('/api/users')
            .expect(expectedUsers)
        );
    });
  });

  describe(`PATCH /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456;
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } });
      });
    });

    context('Given there are users in the database', () => {
      beforeEach('insert users', () => {
        return db.into('searchstream_users').insert(testUsers);
      });

      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2;
        const updateUser = {
          username: 'updated user name',
          email: 'updated user email'
        };
        const expectedUser = {
          ...testUsers[1],
          ...updateUser
        };
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send(updateUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .expect(expectedUser)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'username', 'password' or 'email'`
            }
          });
      });
    });
  });
});