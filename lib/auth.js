'use strict';
const { security, SecurityPasswordError } = require('./security');
const { ERRORS, registerError, ConnectionError, userService } = require('web-soft-server');

registerError('SECURITY_PASSWORD_ERROR', 40600, 'Problem with password strength.');
registerError('ACCOUNT_LOCKOUT_ERROR', 40601, 'Too many fail attempts to login.');

const OBSERVATION_WINDOW = 5 * 60 * 1000;
const LOCKOUT_THRESHOLD = 3;

class LockoutRecord {
  constructor() {
    this.lock = false;
    this.lockTime = 0;
    this.attempts = [Date.now()];
  }

  fail() {
    const time = Date.now();
    this.attempts.push(time);
    this.renew(time);
    if (this.attempts.length >= LOCKOUT_THRESHOLD) {
      this.attempts = [];
      this.lock = true;
      this.lockTime = time;
    }
  }

  freeTime() {
    const time = Date.now();
    const delta = OBSERVATION_WINDOW - (time - this.lockTime);
    return delta > 0 ? delta : 0;
  }

  isLock() {
    const time = Date.now();
    if (this.lock === true) {
      return time - this.lockTime < OBSERVATION_WINDOW;
    }

    return false;
  }

  renew(time) {
    this.attempts = this.attempts.filter((value) => time - value < OBSERVATION_WINDOW);
  }
}

class LockoutManager {
  constructor() {
    this.lockouts = new Map();
  }

  access(username) {
    if (this.lockouts.has(username)) {
      const lockout = this.lockouts.get(username);
      if (lockout.isLock() === true)
        throw new ConnectionError(ERRORS.ACCOUNT_LOCKOUT_ERROR, { time: lockout.freeTime() });
      if (lockout.attempts.length === 0) this.lockouts.delete(username);
      return true;
    }
    return true;
  }

  fail(username) {
    if (this.lockouts.has(username)) {
      const lockout = this.lockouts.get(username);
      lockout.fail();
      if (lockout.isLock() === true)
        throw new ConnectionError(ERRORS.ACCOUNT_LOCKOUT_ERROR, { time: lockout.freeTime() });
    } else {
      this.lockouts.set(username, new LockoutRecord());
    }
  }
}

const lockoutManager = new LockoutManager();

class Auth {
  constructor(manager = lockoutManager) {
    this.lockoutManager = manager;
  }

  async register({ username, password }, context) {
    try {
      const hash = await security.hashPassword(password);
      const user = await userService.save(username, hash);
      await context.startSession(user);
      return { username: user.username, role: user.role, createdTime: user.createdTime };
    } catch (error) {
      this.handleError(error);
    }
  }

  async login({ username, password }, context) {
    if (context.session.username !== username) {
      const user = await userService.getByUsername(username);
      await this.confirm(password, user);
      await context.startSession(user);
    }
    return { username, role: context.user.role, createdTime: context.user.createdTime };
  }

  async logout(data, context) {
    await context.deleteSession();
  }

  async me(data, context) {
    const { username, role, createdTime } = context.user;
    return { username, role, createdTime };
  }

  async changePassword({ oldPassword, newPassword }, context) {
    try {
      const { username, role, createdTime } = context.user;
      await this.confirm(oldPassword, context.user);
      const hash = await security.hashPassword(newPassword);
      await userService.updatePassword(username, hash);
      return { username, role, createdTime };
    } catch (error) {
      this.handleError(error);
    }
  }

  async confirm(password, user) {
    this.lockoutManager.access(user.username);
    if (await security.validatePassword(password, user.password || undefined)) {
      return true;
    }

    if (user.username) this.lockoutManager.fail(user.username);
    throw new ConnectionError(ERRORS.AUTHENTICATION_FAILED);
  }

  handleError(error) {
    if (error instanceof SecurityPasswordError) {
      throw new ConnectionError(ERRORS.SECURITY_PASSWORD_ERROR, { hint: error.message });
    } else {
      throw error;
    }
  }
}

module.exports = { Auth, LockoutManager, LockoutRecord, OBSERVATION_WINDOW, LOCKOUT_THRESHOLD, lockoutManager };
