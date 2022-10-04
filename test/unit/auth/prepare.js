const { security } = require('../../../lib/security');
const { userService } = require('web-soft-server');
const { Auth, LockoutManager, LockoutRecord, OBSERVATION_WINDOW, LOCKOUT_THRESHOLD } = require('../../../lib/auth');
const { MessageService, TwoFactorAuth, CODE_TIMEOUT } = require('../../../lib/two-factor-auth');

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
      ACCOUNT_LOCKOUT_ERROR: {
        code: 40601,
        message: 'Too many fail attempts to login.'
      },
      CODE_NOT_FOUND_ERROR: {
        code: 40602,
        message: 'No code found.'
      },
      CODE_EXISTS_ERROR: {
        code: 40603,
        message: 'Code already exists, try later.'
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

const createMessageService = (transport) => {
  const result = new MessageService();
  result.transport = transport || null;
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
  createMessageService,
  getContext,
  userService,
  OBSERVATION_WINDOW,
  LOCKOUT_THRESHOLD,
  CODE_TIMEOUT
};
