const { Auth } = require('./auth');
const { security } = require('./security');
const { ERRORS, registerError, ConnectionError, userService } = require('web-soft-server');

registerError('CODE_NOT_FOUND_ERROR', 40602, 'No code found.');
registerError('CODE_EXISTS_ERROR', 40603, 'Code already exists, try later.');

//5 minutes
const CODE_TIMEOUT = 5 * 60 * 1000;

class Code {
  constructor(number, timeout) {
    this.number = number;
    this.expire = Date.now() + timeout;
  }
}

class MessageService {
  constructor() {
    this.transport = null;
    this.codeTimeOut = CODE_TIMEOUT;
    this.codes = new Map();
  }

  setTransport(transport) {
    if (!transport || typeof transport.send !== 'function') throw new Error('Incorrect transport for MessageService.');
    this.transport = transport;
  }

  setCodeTimeOut(timeout = 0) {
    this.codeTimeOut = timeout > 0 ? timeout : CODE_TIMEOUT;
  }

  async send(destination) {
    if (!this.transport) throw new Error('MessageService.transport is not defined.');
    this.checkDestination(destination);
    const number = await security.getRandomCode();
    await this.transport.send(destination, number);
    this.codes.set(destination, new Code(number, this.codeTimeOut));
    return destination;
  }

  checkDestination(destination) {
    const time = Date.now();
    if (this.codes.has(destination)) {
      const code = this.codes.get(destination);
      const delta = code.expire - time;
      if (delta > 0) throw new ConnectionError(ERRORS.CODE_EXISTS_ERROR, { time: delta });
      this.codes.delete(destination);
      return true;
    }
    return true;
  }

  getCode(destination) {
    const time = Date.now();
    if (this.codes.has(destination)) {
      const code = this.codes.get(destination);
      const delta = code.expire - time;
      if (delta <= 0) throw new ConnectionError(ERRORS.CODE_NOT_FOUND_ERROR);
      return code.number;
    }
    throw new ConnectionError(ERRORS.CODE_NOT_FOUND_ERROR);
  }

  deleteCode(destination) {
    this.codes.delete(destination);
  }
}

const messageService = new MessageService();

class TwoFactorAuth extends Auth {
  constructor(service = messageService, lockerManager) {
    super(lockerManager);
    this.messageService = service;
  }

  async register({ username, password, code }, context) {
    if (code === this.messageService.getCode(username)) {
      this.messageService.deleteCode(username);
      return await super.register({ username, password }, context);
    }
  }

  async restore({ username, password, code }) {
    if (code === this.messageService.getCode(username)) {
      this.messageService.deleteCode(username);
      const hash = await security.hashPassword(password);
      await userService.updatePassword(username, hash);
      return username;
    }
  }

  async send({ destination }) {
    return await messageService.send(destination);
  }
}

module.exports = { TwoFactorAuth, MessageService, CODE_TIMEOUT, messageService };
