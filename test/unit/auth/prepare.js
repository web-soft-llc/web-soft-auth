const { security } = require('../../../lib/security');
const { userService } = require('web-soft-server');
const { Auth, LockoutManager, LockoutRecord, OBSERVATION_WINDOW, LOCKOUT_THRESHOLD } = require('../../../lib/auth');

jest.mock('../../../lib/security', () => {
  return {
    security: {
      validatePassword: jest.fn((password) => {
        return password === 'testPassword';
      }),
      hashPassword: jest.fn()
    },

    SecurityPasswordError: class SecurityPasswordError extends Error {
      constructor(message) {
        super(message);
      }
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
      },
      SECURITY_PASSWORD_ERROR: {
        code: 40600,
        message: 'Problem with password strength.'
      },
      ACCOUNT_LOCKOUT: {
        code: 40601,
        message: 'Too many fail attempts to login.'
      }
    },
    ConnectionError: class ConnectionError extends Error {
      constructor(data) {
        super(data.message);
      }
    },

    registerError() {}
  };
});

beforeEach(() => {
  userService.getByUsername.mockClear();
  security.validatePassword.mockClear();
  userService.updatePassword.mockClear();
});

const createAuth = () => {
  const result = new Auth(new LockoutManager());
  result.lockoutManager.fail = jest.fn(() => {});
  result.lockoutManager.access = jest.fn(() => {});
  return result;
};

const createLockoutManager = () => {
  const result = new LockoutManager();
  return result;
};

const createLockoutRecord = (attemps, lock = false, lockTime = 0) => {
  const result = new LockoutRecord();
  for (let i = 0; i < attemps; i++) {
    result.attempts.push(Date.now());
  }

  result.lock = lock;
  result.lockTime = lockTime;
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
  createLockoutManager,
  createLockoutRecord,
  getContext,
  userService,
  OBSERVATION_WINDOW,
  LOCKOUT_THRESHOLD
};
