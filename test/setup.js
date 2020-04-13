require('dotenv').config();
process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';
process.env.TEST_DB_URL =
  process.env.TEST_DB_URL || 'postgresql://postgres@localhost/metalspace-test';
process.env.JWT_EXPIRY = '3m';

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;