const { test, expect, describe } = require('@jest/globals');
const { createLockoutRecord, createLockoutManager, LOCKOUT_THRESHOLD, OBSERVATION_WINDOW } = require('./prepare');

describe('LockoutRecord', () => {
  test('LockoutRecordFail_SetLockTrue_FailMoreOrEquelThenThreshold', () => {
    const record = createLockoutRecord(LOCKOUT_THRESHOLD);
    record.fail();
    expect(record.lock).toBe(true);
  });

  test('LockoutRecordFail_NotSetLockTrue_FailLessThenThreshold', () => {
    const record = createLockoutRecord(0);
    record.fail();
    expect(record.lock).toBe(false);
  });

  test('LockoutRecordFreeTime_Return0_LockTimePassed', () => {
    const record = createLockoutRecord(0, true, Date.now() - OBSERVATION_WINDOW);
    expect(record.freeTime()).toBe(0);
  });

  test('LockoutRecordFreeTime_ReturnTimeMoreThen0_LockTimeNotPassed', () => {
    const record = createLockoutRecord(0, true, Date.now());
    expect(record.freeTime()).toBeGreaterThan(0);
  });

  test('LockoutRecordIsLock_ReturnFalse_RecordNotLocked', () => {
    const record = createLockoutRecord(0);
    expect(record.isLock()).toBe(false);
  });

  test('LockoutRecordIsLock_ReturnFalse_RecordLockedTimePassed', () => {
    const record = createLockoutRecord(0, true, Date.now() - OBSERVATION_WINDOW);
    expect(record.isLock()).toBe(false);
  });

  test('LockoutRecordIsLock_ReturnTrue_RecordLockedTimeNotPassed', () => {
    const record = createLockoutRecord(0, true, Date.now());
    expect(record.isLock()).toBe(true);
  });

  test('LockoutRenew_DeleteOldAttempts_ExistAttemptsOlderThenWindow', () => {
    const record = createLockoutRecord();
    const length = record.attempts.length;
    record.attempts.push(Date.now() - OBSERVATION_WINDOW);
    record.renew(Date.now());
    expect(record.attempts.length).toBe(length);
  });
});

describe('LockoutManager', () => {
  test('LockoutManagerAccess_ReturnTrue_UsernameHasNoRecord', () => {
    const manager = createLockoutManager();
    expect(manager.access('testUser')).toBe(true);
  });

  test('LockoutManagerAccess_ThrowError_UsernameRecordLocked', () => {
    const fakeRecord = {
      isLock: jest.fn(() => {
        return true;
      }),
      freeTime: jest.fn(() => {})
    };
    const manager = createLockoutManager();
    manager.lockouts.set('testUser', fakeRecord);
    expect(() => {
      manager.access('testUser');
    }).toThrowError(/attempts/i);
  });

  test('LockoutManagerAccess_ReturnTrue_UsernameRecordUnlocked', () => {
    const fakeRecord = {
      isLock: jest.fn(() => {
        return false;
      }),
      attempts: []
    };

    const manager = createLockoutManager();
    manager.lockouts.set('testUser', fakeRecord);
    expect(manager.access('testUser')).toBe(true);
  });

  test('LockoutManagerAccess_DeleteUsernameRecord_RecordAttemptsEmpty', () => {
    const fakeRecord = {
      isLock: jest.fn(() => {
        return false;
      }),
      attempts: []
    };

    const manager = createLockoutManager();
    manager.lockouts.set('testUser', fakeRecord);
    manager.access('testUser');
    expect(manager.lockouts.size).toBe(0);
  });

  test('LockoutManagerFail_CreateNewRecord_RecordNotExist', () => {
    const manager = createLockoutManager();
    manager.fail('testUser');
    expect(manager.lockouts.size).toBe(1);
  });

  test('LockoutManagerFail_ThrowError_UsernameRecordLocked', () => {
    const fakeRecord = {
      isLock: jest.fn(() => {
        return true;
      }),
      fail: jest.fn(() => {}),
      freeTime: jest.fn(() => {})
    };
    const manager = createLockoutManager();
    manager.lockouts.set('testUser', fakeRecord);
    expect(() => {
      manager.fail('testUser');
    }).toThrowError(/attempts/i);
  });
});
