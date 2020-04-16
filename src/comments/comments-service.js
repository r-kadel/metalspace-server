const xss = require('xss');

const CommentsService = {
  getAllComments(knex) {
    return knex.select('*').from('metalspace_comments');
  },

  getById(knex, id) {
    return knex.from('metalspace_comments').select('*').where('id', id).first();
  },

  insertComment(db, newComment){
    return db
    .insert(newComment)
    .into('metalspace_comments')
    .returning('*')
    .then(([comment]) => comment)
  },

  deleteComment(db, id) {
    return db.from('metalspace_comments').where({ id }).delete();
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      content: xss(comment.content),
      user: comment.user_id,
      postId: comment.post_id,
      date_created: comment.date_created
    }
  }
}

module.exports = CommentsService