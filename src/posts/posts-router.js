const express = require('express');
const path = require('path');
const PostsService = require('./posts-service');
const { requireAuth } = require('../auth/jwt-auth');

const postRouter = express.Router();
const jsonBodyParser = express.json();

postRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    PostsService.getAllPosts(knexInstance)
      .then((posts) => {
        res.json(posts.map(PostsService.serializePost));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { content, user_id } = req.body;
    const newPost = { content, user_id };

    for (const [key, value] of Object.entries(newPost))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    newPost.user_id = req.user.id;

    PostsService.insertPost(req.app.get('db'), newPost)
      .then((post) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${post.id}`))
          .json(PostsService.serializePost(post));
      })
      .catch(next);
  });
postRouter
  .route('/:post_id')
  // check for post id
  .all((req, res, next) => {
    PostsService.getById(req.app.get('db'), req.params.post_id)
      .then((post) => {
        if (!post) {
          return res.status(404).json({
            error: { message: `No such post` },
          });
        }
        res.post = post;
        next();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    PostsService.deletePost(req.app.get('db'), req.params.post_id)
      .then((numRowsAffected) => res.status(204))
      .catch(next);
  });

module.exports = postRouter;
