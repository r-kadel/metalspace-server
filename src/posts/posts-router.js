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
      .then(posts => {
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

module.exports = postRouter;
