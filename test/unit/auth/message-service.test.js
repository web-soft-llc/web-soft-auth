const { test, expect } = require('@jest/globals');
const { createMessageService, CODE_TIMEOUT } = require('./prepare');

test('MessageServiceSetTransport_ThrowError_IncorrectTransportPassed', () => {
  const service = createMessageService();
  expect(() => {
    service.setTransport({});
  }).toThrowError(/incorrect/i);
});

test('MessageServiceSetCodeTimeout_SetTimeout_TimeoutMoreThen0', () => {
  const service = createMessageService();
  service.setCodeTimeOut(CODE_TIMEOUT + 1);
  expect(service.codeTimeOut).toBe(CODE_TIMEOUT + 1);
});

test('MessageServiceSetCodeTimeout_SetDefault_TimeoutLessOrEqualThen0', () => {
  const service = createMessageService();
  service.setCodeTimeOut(0);
  expect(service.codeTimeOut).toBe(CODE_TIMEOUT);
});

test('MessageServiceSend_ThrowError_TransportNotDefined', async () => {
  const service = createMessageService();
  await expect(service.send('testDestination')).rejects.toThrowError(/defined/i);
});

test('MessageServiceCheckDestination_ReturnTrue_NoCodeForDestinationExist', () => {
  const service = createMessageService();
  expect(service.checkDestination('testDestination')).toBe(true);
});

test('MessageServiceCheckDestination_ReturnTrue_CodeForDestinationExist', () => {
  const service = createMessageService();
  service.codes.set('testDestination', { number: 1, expire: Date.now() + CODE_TIMEOUT });
  expect(() => {
    service.checkDestination('testDestination');
  }).toThrowError(/exists/i);
});

test('MessageServiceCheckDestination_ReturnTrue_CodeForDestinationTimeout', () => {
  const service = createMessageService();
  service.codes.set('testDestination', { number: 1, expire: Date.now() - CODE_TIMEOUT });
  expect(service.checkDestination('testDestination')).toBe(true);
});

test('MessageServiceGetCode_ThrowError_NoCodeForDestinationExist', () => {
  const service = createMessageService();
  expect(() => {
    service.getCode('testDestination');
  }).toThrowError(/found/i);
});

test('MessageServiceGetCode_ReturnNumber_CodeForDestinationExist', () => {
  const service = createMessageService();
  service.codes.set('testDestination', { number: 1, expire: Date.now() + CODE_TIMEOUT });
  expect(service.getCode('testDestination')).toBe(1);
});

test('MessageServiceGetCode_ThrowError_CodeForDestinationTimeout', () => {
  const service = createMessageService();
  service.codes.set('testDestination', { number: 1, expire: Date.now() - CODE_TIMEOUT });
  expect(() => {
    service.getCode('testDestination');
  }).toThrowError(/found/i);
});
