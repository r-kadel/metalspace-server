const path = require('path');
const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: user.id,
  username: xss(user.username),
  email: xss(user.email),
  date_created: user.date_created,
  image_url: user.image_url,
  favorite_band: user.favorite_band,
  location: user.location,
});

const serializeUserById = (user) => ({
  id: user.id,
  username: xss(user.username),
  date_created: user.date_created,
  image_url: user.image_url,
  favorite_band: user.favorite_band,
  location: user.location,
});

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then((users) => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  })
  //create a user
  .post(jsonParser, (req, res, next) => {
    const { username, password, email, location, favorite_band } = req.body;
    const newUser = { username, password, email };

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    // no duplicate usernames
    UsersService.hasUserWithUserName(req.app.get('db'), username)
      .then((hasUserWithUserName) => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` });

        return UsersService.hashPassword(password).then((hashedPassword) => {
          const newUser = {
            username,
            password: hashedPassword,
            email,
            location: location,
            favorite_band,
            date_created: 'now()',
          };

          return UsersService.insertUser(req.app.get('db'), newUser).then(
            (user) => {
              res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(serializeUser(user));
            }
          );
        });
      })
      .catch(next);
  });

usersRouter
  .route('/:user_id')
  // check for user id
  .all((req, res, next) => {
    UsersService.getById(req.app.get('db'), req.params.user_id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` },
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUserById(res.user));
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(req.app.get('db'), req.params.user_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { username, password, email, image_url, location, favorite_band } = req.body;
    const userToUpdate = { username, password, email, image_url, location, favorite_band };

    //make sure something is being patched
    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'username', 'password' or 'email'`,
        },
      });

    UsersService.updateUser(req.app.get('db'), req.params.user_id, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;
