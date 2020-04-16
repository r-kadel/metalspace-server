const express = require('express');
const path = require('path');
const CommentsService = require('./comments-service')
const { requireAuth } = require('../auth/jwt-auth');

const commentsRouter = express.Router();
const jsonBodyParser = express.json();

commentsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    CommentsService.getAllComments(knexInstance)
      .then(comments => {
        res.json(comments.map(CommentsService.serializeComment));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { content, user_id, post_id } = req.body;
    const newComment = { content, user_id, post_id };

    for (const [key, value] of Object.entries(newComment))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    CommentsService.insertComment(req.app.get('db'), newComment)
      .then((comment) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.id}`))
          .json(CommentsService.serializeComment(comment));
      })
      .catch(next);
  });

  commentsRouter
  .route('/:comment_id')
  // check for comment id
  .all((req, res, next) => {
    CommentsService.getById(req.app.get('db'), req.params.comment_id)
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({
            error: { message: `No such comment` },
          });
        }
        res.comment = comment;
        next();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    CommentsService.deleteComment(req.app.get('db'), req.params.comment_id)
      .then((numRowsAffected) => res.status(204))
      .catch(next);
  });

module.exports = commentsRouter;
