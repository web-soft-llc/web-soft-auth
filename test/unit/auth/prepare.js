const { security } = require('../../../lib/security');
const { userService } = require('web-soft-server');
const { Auth } = require('../../../lib/auth');

jest.mock('../../../lib/security', () => {
  return {
    security: {
      validatePassword: jest.fn((password) => {
        return password === 'testPassword';
      }),
      hashPassword: jest.fn()
    }
  };
});

jest.mock('web-soft-server', () => {
  return {
    userService: {
      getByUsername: jest.fn((username) => {
        return { username, password: 'testPassword' };
      }),
      updatePassword: jest.fn()
    },

    ERRORS: {
      AUTHENTICATION_FAILED: {
        code: 1,
        message: 'Authentication failed.'
      }
    },
    ConnectionError: class ConnectionError extends Error {
      constructor(data) {
        super(data.message);
      }
    }
  };
});

beforeEach(() => {
  userService.getByUsername.mockClear();
  security.validatePassword.mockClear();
  userService.updatePassword.mockClear();
});

const createAuth = () => {
  const result = new Auth();
  return result;
};

const getContext = (session = {}, user = {}) => {
  const result = {};
  result.startSession = jest.fn(() => {});
  result.session = session;
  result.user = user;
  return result;
};

module.exports = {
  createAuth,
  getContext,
  userService
};
