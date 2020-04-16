const xss = require('xss');

const PostsService = {
  getAllPosts(knex) {
    return knex.select('*').from('metalspace_posts');
  },

  getById(knex, id) {
    return knex.from('metalspace_posts').select('*').where('id', id).first();
  },

  insertPost(db, newPost) {
    return db
      .insert(newPost)
      .into('metalspace_posts')
      .returning('*')
      .then(([post]) => post);
  },

  deletePost(db, id) {
    return db.from('metalspace_posts').where({ id }).delete();
  },

  serializePost(post) {
    return {
      id: post.id,
      user_id: post.user_id,
      content: xss(post.content),
      date_created: post.date_created,
    };
  },
};

module.exports = PostsService;
