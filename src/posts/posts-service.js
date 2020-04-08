const xss = require('xss');

const PostsService = {
  getAllPosts(knex) {
    return knex.select('*').from('metalspace_posts');
  },

  insertPost(db, newPost){
    return db
    .insert(newPost)
    .into('metalspace_posts')
    .returning('*')
    .then(([post]) => post)
  },

  serializePost(post) {
    return {
      id: post.id,
      content: xss(post.content),
      date_created: post.date_created
    }
  }
}

module.exports = PostsService