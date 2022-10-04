const AuthModule = require('./auth-module');
const TwoFactorAuthModule = require('./two-factor-auth-module');
const {
  Auth,
  LOCKOUT_THRESHOLD,
  LockoutManager,
  lockoutManager,
  LockoutRecord,
  OBSERVATION_WINDOW
} = require('./auth');

const { TwoFactorAuth, MessageService, messageService, CODE_TIMEOUT } = require('./two-factor-auth');

module.exports = {
  AuthModule,
  TwoFactorAuthModule,
  Auth,
  LockoutManager,
  LOCKOUT_THRESHOLD,
  lockoutManager,
  LockoutRecord,
  OBSERVATION_WINDOW,
  TwoFactorAuth,
  MessageService,
  messageService,
  CODE_TIMEOUT
};
