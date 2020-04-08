const bcrypt = require('bcryptjs');

const UsersService = {
  getAllUsers(knex) {
    return knex.select('*').from('metalspace_users');
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('metalspace_users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex
      .from('metalspace_users')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteUser(knex, id) {
    return knex('metalspace_users')
      .where({ id })
      .delete();
  },

  updateUser(knex, id, newUserFields) {
    return knex('metalspace_users')
      .where({ id })
      .update(newUserFields);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  hasUserWithUserName(db, username) {
    return db('metalspace_users')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hasUserWithEmail(db, email) {
    return db('metalspace_users')
      .where({ email })
      .first()
      .then(email => !!email);
  }
};

module.exports = UsersService;
