'use strict';
const crypto = require('crypto');
const commonPasswords = require('./common-passwords.json');

const MIN_CODE_NUMBER = 100000;
const MAX_CODE_NUMBER = 999999;
const SALT_LEN = 32;
const KEY_LEN = 64;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const SCRYPT_PARAMS = { N: 32768, r: 8, p: 2, maxmem: 64 * 1024 * 1024 };
const SCRYPT_PREFIX = 'scrypt$N=32768,r=8,p=2,maxmem=67108864$';

class SecurityPasswordError extends Error {
  constructor(message) {
    super(message);
  }
}

class SecurityUtil {
  constructor() {
    this.defaultHash = '';
    this.hash('').then((hash) => {
      this.defaultHash = hash;
    });
  }

  async getRandomCode() {
    return new Promise((resolve, reject) => {
      crypto.randomInt(MIN_CODE_NUMBER, MAX_CODE_NUMBER, (error, number) => {
        if (error) reject(error);
        resolve(number);
      });
    });
  }

  serializeHash(hash, salt) {
    const saltString = salt.toString('base64').split('=')[0];
    const hashString = hash.toString('base64').split('=')[0];
    return `${SCRYPT_PREFIX}${saltString}$${hashString}`;
  }

  deserializeHash(serializedString) {
    const tokens = serializedString.split('$');
    if (tokens[0] !== 'scrypt') {
      throw new Error('Only script hash function supported.');
    }
    const params = Object.fromEntries(
      tokens[1].split(',').map((param) => {
        const [name, value] = param.split('=');
        return [name, Number(value)];
      })
    );
    const salt = Buffer.from(tokens[2], 'base64');
    const hash = Buffer.from(tokens[3], 'base64');
    return { params, salt, hash };
  }

  async hashPassword(password) {
    return await this.hash(this.preparePassword(password));
  }

  hash(password) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(SALT_LEN, (err, salt) => {
        if (err) {
          reject(err);
          return;
        }
        crypto.scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.serializeHash(hash, salt));
        });
      });
    });
  }

  validatePassword(password, hashPassword = this.defaultHash) {
    const { params, salt, hash } = this.deserializeHash(hashPassword);
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, hash.length, params, (err, hashedPassword) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(crypto.timingSafeEqual(hashedPassword, hash));
      });
    });
  }

  preparePassword(password) {
    const result = password.replace(/\s\s+/g, ' ');
    this.checkPasswordStrength(result);
    return result;
  }

  checkPasswordStrength(password) {
    if (password.length < MIN_PASSWORD_LENGTH) throw new SecurityPasswordError('Password is too short.');
    if (password.length > MAX_PASSWORD_LENGTH) throw new SecurityPasswordError('Password is too long.');
    if (commonPasswords.includes(password)) throw new SecurityPasswordError('Weak password.');
  }
}

module.exports = {
  security: new SecurityUtil(),
  SecurityPasswordError
};
