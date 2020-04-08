const xss = require('xss');

const CommentsService = {
  getAllComments(knex) {
    return knex.select('*').from('metalspace_comments');
  },

  insertComment(db, newComment){
    return db
    .insert(newComment)
    .into('metalspace_comments')
    .returning('*')
    .then(([comment]) => comment)
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      content: xss(comment.content),
      user: comment.user_id,
      date_created: comment.date_created
    }
  }
}

module.exports = CommentsService