  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


function makeUsers() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      password: 'password',
      email: 'newemail@gmail.com',
      date_created: '2029-01-22T16:28:32.615Z',
      image_url: 'null'
    },
    {
      id: 2,
      username: 'test-user-2',
      password: 'password',
      email: 'fakemail@yahoo.com',
      date_created: '2029-01-22T16:28:32.615Z',
      image_url: 'null'
    }
  ];
}

function makePosts() {
  return [
    {
      id: 1,
      user_id: 1,
      content: 'test post',
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ]
}

function makeComments() {
  return [
    {
      id: 1,
      user_id: 1,
      content: 'test comment',
      post_id: 1,
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ]
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into('metalspace_users')
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('metalspace_users_id_seq', ?)`, [
        users[users.length - 1].id
      ])
    );
}

function cleanTable(db) {
  return db.raw(
    `TRUNCATE
      metalspace_users,
      metalspace_posts,
      metalspace_comments`
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256'
  });
  console.log(token)
  return `bearer ${token}`;
}

module.exports = {
  makeUsers,
  cleanTable,
  seedUsers,
  makeAuthHeader,
  makePosts,
  makeComments
};