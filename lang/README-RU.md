# **Версия 1.2.0**

# **Содержание**

- [web-soft-auth](#web-soft-auth)
  - [Class: web-soft-auth.Auth](#auth-class)
    - [new Auth([manager])](#new-auth)
    - [auth.register(data, context)](#auth-register)
    - [auth.login(data, context)](#auth-login)
    - [auth.logout(data, context)](#auth-logout)
    - [auth.me(data, context)](#auth-me)
    - [auth.hangePassword(data, context)](#auth-change-password)
  - [Class: web-soft-auth.LockoutManager](#lockout-manager-class)
    - [lockoutManager.access(username)](#lockout-manager-access)
    - [lockoutManager.fail(username)](#lockout-manager-fail)
  - [Class: web-soft-auth.TwoFactorAuth](#two-factor-auth-class)
    - [new TwoFactorAuth([service, [manager]])](#new-two-factor-auth)
    - [twoFactorAuth.register(data, context)](#two-factor-auth-register)
    - [twoFactorAuth.restore(data, context)](#two-factor-auth-restore)
    - [twoFactorAuth.send(data)](#two-factor-auth-send)
  - [Class: web-soft-auth.ation-windowMessageService](#message-service-class)
    - [messageService.setTransport(transport)](#message-service-set-transport)
    - [messageService.setCodeTimeOut(timeout)](#message-service-set-code-timeout)
    - [messageService.send(destination)](#message-service-send)
    - [messageService.checkDestination(destination)](#message-service-check-destination)
    - [messageService.getCode(destination)](#message-service-get-code)
    - [messageService.deleteCode(destination)](#message-service-delete-code)
  - [Module: web-soft-auth.AuthModule](#auth-module)
  - [Module: web-soft-auth.TwoFactorAuthModule](#two-factor-auth-module)
  - [Interface: web-soft-auth.MessageTransport](#message-transport-interface)
    - [messageTransport.send(destination, code)](#message-transport-send)
  - [web-soft-auth.messageService](#message-service)
  - [web-soft-auth.lockoutManager](#lockout-manager)
  - [web-soft-auth.CODE_TIMEOUT](#code-timeout)
  - [web-soft-auth.OBSERVATION_WINDOW](#observation-window)
  - [web-soft-auth.LOCKOUT_THRESHOLD](#lockout-threshold)
  - [web-soft-auth error codes](#error-codes)
    - [SECURITY_PASSWORD_ERROR](#security-password-error)
    - [ACCOUNT_LOCKOUT_ERROR](#account-lockout-error)
    - [CODE_NOT_FOUND_ERROR](#code-not-found-error)
    - [CODE_EXISTS_ERROR](#code-exists-error)

# **web-soft-auth<a name="web-soft-auth"></a>**

Модуль авторизации/аутентификации для использования совместно с пакетом [web-soft-server](https://github.com/web-soft-llc/web-soft-server). Используется авторизация/аутентификация на основе механизма сессий. За хранение сессий отвечает пакет [web-soft-server](https://github.com/web-soft-llc/web-soft-server). На данный момент доступно два модуля: простой модуль [AuthModule](#auth-module) и модуль с двухфакторной аутентификацией [TwoFactorAuthModule](#two-factor-auth-module).

Пример использования простого модуля [AuthModule](#auth-module):

```
const { Server, logger } = require('web-soft-server');
const { AuthModule } = require('../index');
const modules = require('./modules');

let server = {};

const start = async () => {
  try {
    server = new Server({ host: '0.0.0.0', port: 8000, cors: false });
    server.start({ ...modules, auth: AuthModule });
  } catch (error) {
    logger.fatal(error);
  }
};

start();
```

Пример использования модуля с двухфакторной аутентификацией [TwoFactorAuthModule](#two-factor-auth-module). В данном случае необходимо передать объекту [messageService](#message-service) объект транспорта, который должен реализовывать интерфейс [MessageTransport](#message-transport), иначе при попытке отправки сообщения будет выбрасываться исключение:

```
const { Server, logger } = require('web-soft-server');
const { TwoFactorAuthModule, messageService } = require('../index');
const messageTransport = require('./message-transport.js');
const modules = require('./modules');

messageService.setTransport(messageTransport);
let server = {};

const start = async () => {
  try {
    server = new Server({ host: '0.0.0.0', port: 8000, cors: false });
    server.start({ ...modules, auth: TwoFactorAuthModule });
  } catch (error) {
    logger.fatal(error);
  }
};

start();
```

## **Class: web-soft-auth.Auth<a name="auth-class"></a>**

Предоставляет методы связанные с простой авторизацией/аутентификацией. Является базовым классом для класса [TwoFactorAuth](#two-factor-auth).

### **new Auth([manager])<a name="new-auth"></a>**

- `manager` <[LockoutManager](#lockout-manager-class)> экземпляр класса [LockoutManager](#lockout-manager-class), отвечающий за временную блокировку аккаунтов пользователей, совершивших неудачную попытку входа более [LOCKOUT_THRESHOLD](#lockout-threshold) раз в течение [OBSERVATION_WINDOW](#observation-window) времени. **Default:** [lockoutManager](#lockout-manager)

### **auth.register(data, context)<a name="auth-register"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> объект с данными нового пользователя:
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя, минимальная длина 2 символа.
  - `password` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> пароль.
- `context` <[Client](#client-interface)> объект имплементирующий интерфейс [Client](#client-interface) для инициализации сессии пользователя, после успешной регистрации.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта созданного пользователя.
  - `role` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> роль созданного пользователя.
  - `createdTime` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> время добавления пользователя в БД.

Метод регистрации нового пользователя.

В целях безопасности, к паролю предъявляются следующие требования: минимальная длина - 12 символов, максимальная длина - 128 символов, все повторяющиеся подряд идущие пробельные символы заменяются одним пробельным символом, так же пароль не должен входить в список 1000 наиболее частых используемых паролей представленным [тут](lib/common-passwords.json).

### **twoFactorAuth.login(data, context)<a name="auth-login"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> объект с данными пользователя.
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.
  - `password` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> пароль.
- `context` <[Client](#client-interface)> объект имплементирующий интерфейс [Client](#client-interface) для инициализации сессии пользователя, после успешной аутентификации.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.
  - `role` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> роль пользователя.
  - `createdTime` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> время добавления пользователя в БД.

Метод аутентификации пользователя.

### **auth.logout(data, context)<a name="auth-logout"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> пустой объект, нужен исключительно для соблюдения контракта и передачи вторым аргументом объекта `context`.
- `context` <[Client](#client-interface)> объект имплементирующий интерфейс [Client](#client-interface) для удаления сессии пользователя.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<void>>

Метод деавторизации пользователя.

### **auth.me(data, context)<a name="auth-me"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> пустой объект, нужен исключительно для соблюдения контракта и передачи вторым аргументом объекта `context`.
- `context` <[Client](#client-interface)> объект имплементирующий интерфейс [Client](#client-interface) для получения информации о текущем пользователе.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.
  - `role` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> роль пользователя.
  - `createdTime` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> время добавления пользователя в БД.

Метод для получения информации о текущем авторизованном пользователе.

### **auth.changePassword(data, context)<a name="auth-change-password"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> объект с данными пользователя.
  - `oldPassword` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> текущий пароль пользователя.
  - `newPassword` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> новый пароль пользователя.
- `context` <[Client](#client-interface)> объект имплементирующий интерфейс [Client](#client-interface) для получения информации о текущем пользователе.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.
  - `role` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> роль пользователя.
  - `createdTime` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> время добавления пользователя в БД.

Метод для смены пароля текущего авторизованного пользователя.

## **Class: web-soft-auth.LockoutManager<a name="lockout-manager-class"></a>**

Отвечает за отслеживание неудачных попыток пользователей пройти аутентификацию и временную блокировку их учётных записей в случае превышения лимита попыток аутентификации.

### **lockoutManager.access(username)<a name="lockout-manager-access"></a>**

- `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.
- Returns: <[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)>

Метод для проверки заблокирован ли аккаунт пользователя, если нет возвращает `true`, иначе выбрасывает исключение [ACCOUNT_LOCKOUT_ERROR](#account-lockout-error).

### **lockoutManager.fail(username)<a name="lockout-manager-fail"></a>**

- `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.

Метод для регистрации неудачной попытки аутентификации пользователя. Если при регистрации неудачной попытки, аккаунт пользователя будет временно заблокирован, будет выброшено исключение [ACCOUNT_LOCKOUT_ERROR](#account-lockout-error).

## **Class: web-soft-auth.TwoFactorAuth<a name="two-factor-auth-class"></a>**

Наследник класса [Auth](auth-class). Переопределяет метод регистрации, добавляет метод восстановления пароля. Не отвечает за отправку кодов, а лишь меняет реализацию базового класса, добавляя логику подтверждения с помощью кода, и предоставляет интерфейс для получения кода.

### **new TwoFactorAuth([service, [manager]])<a name="new-two-factor-auth"></a>**

- `service` <[MessageService](#message-service-class)> экземпляр класса [MessageService](#message-service-class), отвечающий за генерацию кодов и отправку сообщений пользователям. **Default:** [messageService](#message-service)
- `manager` <[LockoutManager](#lockout-manager-class)> экземпляр класса [LockoutManager](#lockout-manager-class), отвечающий за временную блокировку аккаунтов пользователей, совершивших неудачную попытку входа более [LOCKOUT_THRESHOLD](#lockout-threshold) раз в течение [OBSERVATION_WINDOW](#observation-window) времени. **Default:** [lockoutManager](#lockout-manager)

### **twoFactorAuth.register(data, context)<a name="two-factor-auth-register"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> объект с данными нового пользователя:
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя, минимальная длина 2 символа.
  - `password` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> пароль.
  - `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)> полученный код подтверждения.
- `context` <[Client](#client-interface)> объект имплементирующий интерфейс [Client](#client-interface) для инициализации сессии пользователя, после успешной регистрации.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта созданного пользователя.
  - `role` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> роль созданного пользователя.
  - `createdTime` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> время добавления пользователя в БД.

Метод регистрации нового пользователя с подверждением с помощью кода.

В целях безопасности, к паролю предъявляются следующие требования: минимальная длина - 12 символов, максимальная длина - 128 символов, все повторяющиеся подряд идущие пробельные символы заменяются одним пробельным символом, так же пароль не должен входить в список 1000 наиболее частых используемых паролей представленным [тут](lib/common-passwords.json).

### **twoFactorAuth.restore(data)<a name="two-factor-auth-restore"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> объект с данными для восстановления доступа:
  - `username` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> имя аккаунта пользователя.
  - `password` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> пароль.
  - `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)> полученный код подтверждения.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)>>

Метод для восстановления доступа пользователя к системе путём смены пароля. Владение аккаунтом подтверждается через уникальный код, отправленный реализованным приложением способом. В случае успеха, возвращает имя аккаунта пользвателя.

### **twoFactorAuth.send(data)<a name="two-factor-auth-send"></a>**

- `data` <[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> объект с информацией об отправке:
  - `destination` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> адрес отправки кода, может быть номером телефона, адресом почты и т.д.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)>>

Метод для отправки кода по указанному адресу. Возвращает параметр `destination` в случае успешной отправки.

## **Class: web-soft-auth.MessageService<a name="message-service-class"></a>**

Отвечает за отправку и сообщейний с кодом и валидацию полученных кодов. В целях переиспользования кода класс не отвечает непосредственно за доставку сообщений, поэтому для полноценной работы классу необходимо передать объект транспорта, реализующий интерфейс [MessageTransport](#message-transport-interface).

### **messageService.setTransport(transport)<a name="message-service-set-transport"></a>**

- `transport` <[MessageTransport](#message-transport-interface)> объект, отвечающий за доставку сообщений пользователю по указанному адресу.

Метод для установки транспорта сообщений, созданному экземпляру класса.

### **messageService.setCodeTimeOut(timeout)<a name="message-service-set-code-timeout"></a>**

- `timeout` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)> время, спустя которое код, отправленный в сообщении, станет недействительным.

### **messageService.send(destination)<a name="message-service-send"></a>**

- `destination` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> адрес отправки кода, может быть номером телефона, адресом почты и т.д.
- Returns: <[Promise](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)>>

Метод для отправки кода по указанному адресу. Возвращает параметр `destination` в случае успешной отправки.

### **messageService.checkDestination(destination)<a name="message-service-check-destination"></a>**

- `destination` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> адрес отправки кода, может быть номером телефона, адресом почты и т.д.
- Returns: <[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)>

Метод проверяет наличие уже отправленного кода по указанному адресу назначения. Если код уже отправлен и всё ещё действителен, выбрасывается исключение [CODE_EXISTS_ERROR](#code-exists-error), иначе возвращает `true`.

### **messageService.getCode(destination)<a name="message-service-get-code"></a>**

- `destination` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> адрес, для которого нужно получить код.
- Returns: <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)>

Метод возвращает отправленный код для указанного адреса назначения. Если код для указанного адреса не найден, будет выбрашено исключение [CODE_NOT_FOUND_ERROR](#code-not-found-error).

### **messageService.deleteCode(destination)<a name="message-service-delete-code"></a>**

- `destination` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> адрес, для которого нужно удалить код.

Метод удаляет код для указанного адреса.

> **ВАЖНО**: Так как коды храняться в оперативной памяти, необходимо вызывать функцию удаления после подтверждения кода.

## **Module: web-soft-auth.AuthModule<a name="auth-module"></a>**

- <[ServerModule](https://github.com/web-soft-llc/web-soft-server/blob/master/lang/README-RU.md#server.module)>

Модуль простой авторизации/аутентификации для пакета [web-soft-server](https://github.com/web-soft-llc/web-soft-server).

## **Module: web-soft-auth.TwoFactorAuthModule<a name="two-factor-auth-module"></a>**

- <[ServerModule](https://github.com/web-soft-llc/web-soft-server/blob/master/lang/README-RU.md#server.module)>

Модуль с двухфакторной аутентификацией для пакета [web-soft-server](https://github.com/web-soft-llc/web-soft-server).

## **Interface: web-soft-auth.MessageTransport<a name="message-transport-interface"></a>**

Интерфейс объекта, отвечающего за доставку сообщения пользователю.

### **messageTransport.send(destination, code)<a name="message-transport-send"></a>**

- `destination` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> адрес, по которому нужно доставить код.
- `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> код.

Метод отправляет сообщение с кодом адресату. Выбрасывает исключение, в случае неудачной отправки.

## **web-soft-auth.messageService<a name="message-service"></a>**

- <[MessageService](#message-service-class)>

Глобальный экземпляр класса [MessageService](#message-service-class), используемый по умолчанию классом [TwoFactorAuth](#two-factor-auth-class).

## **web-soft-auth.lockoutManager<a name="lockout-manager"></a>**

- <[LockoutManager](#lockout-manager-class)>

Глобальный экземпляр класса [LockoutManager](#lockout-manager-class), используемый по умолчанию классом [Auth](#auth-class).

## **web-soft-auth.CODE_TIMEOUT<a name="code-timeout"></a>**

- <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> время жизни кода после отправки пользователю, 300000 мс.

## **web-soft-auth.OBSERVATION_WINDOW<a name="observation-window"></a>**

- <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> период времени, в течение которого должны произойти неудачные попытки аутентификации для блокировки аккаунта пользователя, 300000 мс.

## **web-soft-auth.LOCKOUT_THRESHOLD<a name="lockout-threshold"></a>**

- <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> количество неудачных попыток аутентификации для блокировки аккаунта пользователя, 3.

## **web-soft-auth error codes<a name="error-codes"></a>**

Коды ошибок, использованные в пакете web-soft-auth.

### **SECURITY_PASSWORD_ERROR<a name="security-password-error"></a>**

- `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> 40600.
- `message` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> Problem with password strength.

### **ACCOUNT_LOCKOUT_ERROR<a name="account-lockout-error"></a>**

- `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> 40601.
- `message` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> Too many fail attempts to login.

### **CODE_NOT_FOUND_ERROR<a name="code-not-found-error"></a>**

- `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> 40602.
- `message` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> No code found.

### **CODE_EXISTS_ERROR<a name="code-exists-error"></a>**

- `code` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> 40603.
- `message` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)> Code already exists, try later.
