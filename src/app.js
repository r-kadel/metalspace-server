require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./error-handler');
const { CLIENT_ORIGIN } = require('./config');
const { NODE_ENV } = require('./config');

const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const postsRouter = require ('./posts/posts-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
// set client origin in config to local host for testing locally
// Dont edit anything else for that purpose!
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.get('/api', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.use(errorHandler);

module.exports = app;
