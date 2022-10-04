'use strict';
const { TwoFactorAuth } = require('./two-factor-auth');
const AuthModule = require('./auth-module');

module.exports = {
  schema: {
    ...AuthModule.schema,
    register: {
      public: true,
      description: 'Регистрация нового пользователя с ролью user.',
      params: {
        type: 'object',
        required: ['username', 'password', 'code'],
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            description: 'Имя пользователя. Минимальная длина 2 символа.'
          },
          password: {
            description: 'Пароль. Минимальная длина 8 символов.',
            minLength: 8,
            type: 'string'
          },
          code: {
            description: 'Код, полученный в сообщении.',
            type: 'number'
          }
        }
      },
      result: {
        type: 'object',
        required: ['username', 'role', 'createdTime'],
        properties: {
          username: {
            description: 'Имя пользователя.',
            type: 'string'
          },
          role: {
            description: 'Роль пользователя.',
            type: 'string'
          },
          createdTime: {
            description: 'Временная метка создания пользователя.',
            type: 'string'
          }
        }
      },
      transport: 'http'
    },

    send: {
      public: true,
      description: 'Отправка сообщение указанному адресу назначения.',
      params: {
        type: 'object',
        required: ['destination'],
        properties: {
          destination: {
            description: 'Адрес назначения, на который нужно отправить код.',
            type: 'string'
          }
        }
      },
      result: {
        description: 'Адрес назначения, на который отправлен код.',
        type: 'string'
      }
    },

    restore: {
      public: true,
      description: 'Восстановление доступа к аккаунту и смена пароля.',
      params: {
        type: 'object',
        required: ['username', 'password', 'code'],
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            description: 'Имя пользователя. Минимальная длина 2 символа.'
          },
          password: {
            description: 'Пароль. Минимальная длина 8 символов.',
            minLength: 8,
            type: 'string'
          },
          code: {
            description: 'Код, полученный в сообщении.',
            type: 'number'
          }
        }
      },
      result: {
        type: 'string',
        description: 'Имя пользователя.'
      },
      transport: 'http'
    }
  },
  Module: TwoFactorAuth
};
