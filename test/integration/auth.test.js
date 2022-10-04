const { test, expect, describe, beforeEach, afterAll } = require('@jest/globals');
const { call, clearTables, closeDatabaseConnection, addTestData, clearCookies, auth } = require('./helpers.js');

const testUserData = {
  username: '89138762355',
  password:
    'scrypt$N=32768,r=8,p=1,maxmem=67108864$WDvlWv547xK6YjokhmlArebEs92/Ug+a8GtU2b+ER84$11RTxyQMbuyft3XJ7nethkvNALfSREfemmr0phYAvam8MC4qp0lSAe91DDmZC2FufT0RKTo18p8do+jj+M8oMw',
  role: 'user'
};

const testLockUserData = {
  username: '89138762345',
  password:
    'scrypt$N=32768,r=8,p=1,maxmem=67108864$WDvlWv547xK6YjokhmlArebEs92/Ug+a8GtU2b+ER84$11RTxyQMbuyft3XJ7nethkvNALfSREfemmr0phYAvam8MC4qp0lSAe91DDmZC2FufT0RKTo18p8do+jj+M8oMw',
  role: 'user'
};

const testLockUserData2 = {
  username: '89138762343',
  password:
    'scrypt$N=32768,r=8,p=1,maxmem=67108864$WDvlWv547xK6YjokhmlArebEs92/Ug+a8GtU2b+ER84$11RTxyQMbuyft3XJ7nethkvNALfSREfemmr0phYAvam8MC4qp0lSAe91DDmZC2FufT0RKTo18p8do+jj+M8oMw',
  role: 'user'
};

const longPassword =
  'passwordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpassword';

describe('Auth', () => {
  beforeEach(async () => {
    await clearTables('SystemUser', 'Session');
    clearCookies();
  });

  test('AuthLogin_SuccessfulRequest', async () => {
    await addTestData('SystemUser', testUserData);
    await expect(call('auth/login', { username: '89138762355', password: 'test_password' })).resolves.toEqual(
      expect.objectContaining({
        username: '89138762355',
        role: 'user',
        createdTime: expect.any(String)
      })
    );
  });

  test('AuthLogin_InvalidParams_Password', async () => {
    await addTestData('SystemUser', testUserData);
    await expect(call('auth/login', { username: '89138762355', password: 'incorrect_password' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Authentication')
      })
    );
  });

  test('AuthLogin_NotFound_User', async () => {
    await expect(call('auth/login', { username: '89138762355', password: 'test_password' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Authentication')
      })
    );
  });

  test('AuthLogin_LockUser_ManyFailAttempts', async () => {
    const incorrect = { username: testLockUserData.username, password: 'incorrect_password' };
    await addTestData('SystemUser', testLockUserData);
    await call('auth/login', incorrect);
    await call('auth/login', incorrect);
    await expect(call('auth/login', incorrect)).resolves.toEqual(
      expect.objectContaining({ code: expect.any(Number), message: expect.stringMatching(/attempts/i) })
    );
  });

  test('AuthRegister_SuccessfulRequest', async () => {
    await expect(call('auth/register', { username: '89138762355', password: 'test_password' })).resolves.toEqual(
      expect.objectContaining({
        username: '89138762355',
        role: 'user',
        createdTime: expect.any(String)
      })
    );
  });

  test('AuthRegister_InvalidParams_EmptyUsername', async () => {
    await expect(call('auth/register', { username: '', password: 'test_password' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Invalid')
      })
    );
  });

  test('AuthRegister_InvalidParams_ShortPassword', async () => {
    await expect(call('auth/register', { username: '89138762355', password: 'password' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringMatching(/strength/i)
      })
    );
  });

  test('AuthRegister_InvalidParams_LongPassword', async () => {
    await expect(call('auth/register', { username: '89138762355', password: longPassword })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringMatching(/strength/i)
      })
    );
  });

  test('AuthRegister_InvalidParams_WeakPassword', async () => {
    await expect(call('auth/register', { username: '89138762355', password: 'longPassword' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringMatching(/strength/i)
      })
    );
  });

  test('AuthRegister_InvalidParams_EmptyPassword', async () => {
    await expect(call('auth/register', { username: '89138762355', password: '' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Invalid')
      })
    );
  });

  test('AuthRegister_DatabaseConflict_SameUsername', async () => {
    await addTestData('SystemUser', testUserData);
    await expect(call('auth/register', { username: '89138762355', password: 'test_password' })).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Conflict')
      })
    );
  });

  test('AuthLogout_SuccessfulRequest', async () => {
    await auth('user');
    await expect(call('auth/logout', {})).resolves.toEqual({});
  });

  test('AuthLogout_InvalidParams_NotAuth', async () => {
    clearCookies();
    await expect(call('auth/logout', {})).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Authentication')
      })
    );
  });

  test('AuthMe_SuccessfulRequest', async () => {
    const user = await auth('user');
    await expect(call('auth/me', {})).resolves.toEqual(
      expect.objectContaining({
        username: user.username,
        role: 'user',
        createdTime: expect.any(String)
      })
    );
  });

  test('AuthMe_InvalidParams_NotAuth', async () => {
    await expect(call('auth/me', {})).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Authentication')
      })
    );
  });

  test('AuthChangePassword_SuccessfulRequest', async () => {
    const user = await auth('user');
    await expect(
      call('auth/changePassword', { oldPassword: user.password, newPassword: 'new_password' })
    ).resolves.toEqual(
      expect.objectContaining({
        username: user.username,
        role: 'user',
        createdTime: expect.any(String)
      })
    );
  });

  test('AuthChangePassword_LockUser_ManyFailAttempts', async () => {
    const incorrect = { oldPassword: 'incorrect_password', newPassword: 'password' };
    await auth('user', testLockUserData2);
    await call('auth/changePassword', incorrect);
    await call('auth/changePassword', incorrect);
    await expect(call('auth/changePassword', incorrect)).resolves.toEqual(
      expect.objectContaining({ code: expect.any(Number), message: expect.stringMatching(/attempts/i) })
    );
  });

  test('AuthChangePassword_InvalidParams_OldPassword', async () => {
    await auth('user');
    await expect(
      call('auth/changePassword', {
        oldPassword: 'invalid_password',
        newPassword: 'new_password'
      })
    ).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Authentication')
      })
    );
  });

  test('AuthChangePassword_InvalidParams_NewPassword', async () => {
    const user = await auth('user');
    await expect(
      call('auth/changePassword', {
        oldPassword: user.password,
        newPassword: ''
      })
    ).resolves.toEqual(
      expect.objectContaining({
        code: expect.any(Number),
        message: expect.stringContaining('Invalid')
      })
    );
  });

  afterAll(async () => {
    await clearTables('SystemUser', 'Session');
    await closeDatabaseConnection();
  });
});
