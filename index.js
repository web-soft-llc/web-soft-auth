const {
  AuthModule,
  TwoFactorAuthModule,
  Auth,
  LockoutManager,
  LOCKOUT_THRESHOLD,
  lockoutManager,
  OBSERVATION_WINDOW,
  TwoFactorAuth,
  MessageService,
  messageService,
  CODE_TIMEOUT
} = require('./lib');

module.exports.AuthModule = AuthModule;
module.exports.TwoFactorAuthModule = TwoFactorAuthModule;
module.exports.Auth = Auth;
module.exports.LockoutManager = LockoutManager;
module.exports.lockoutManager = lockoutManager;
module.exports.TwoFactorAuth = TwoFactorAuth;
module.exports.MessageService = MessageService;
module.exports.messageService = messageService;
module.exports.OBSERVATION_WINDOW = OBSERVATION_WINDOW;
module.exports.LOCKOUT_THRESHOLD = LOCKOUT_THRESHOLD;
module.exports.CODE_TIMEOUT = CODE_TIMEOUT;
