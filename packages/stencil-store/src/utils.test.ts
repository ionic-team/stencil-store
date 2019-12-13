import { StoreSubscription } from './types';
import { toSubscription } from './utils';

describe('toSubscription', () => {
  describe('fn', () => {
    test('return the same function', () => {
      const subscription: StoreSubscription<object> = () => {};

      expect(toSubscription(subscription)).toBe(subscription);
    });
  });

  describe('object', () => {
    test('calls get method', () => {
      const subscriptionObj = mockSubscriptionObject();
      const subscription = toSubscription<{ hola: string }>(subscriptionObj);

      subscription('get', 'hola');

      expect(subscriptionObj.get).toHaveBeenCalledWith('hola');
      expect(subscriptionObj.set).not.toHaveBeenCalled();
      expect(subscriptionObj.reset).not.toHaveBeenCalled();
    });

    test('calls set method', () => {
      const subscriptionObj = mockSubscriptionObject();
      const subscription = toSubscription<{ hola: string }>(subscriptionObj);

      subscription('set', 'hola', 'ola', 'hola');

      expect(subscriptionObj.get).not.toHaveBeenCalled();
      expect(subscriptionObj.set).toHaveBeenCalledWith('hola', 'ola', 'hola');
      expect(subscriptionObj.reset).not.toHaveBeenCalled();
    });

    test('calls reset method', () => {
      const subscriptionObj = mockSubscriptionObject();
      const subscription = toSubscription<{ hola: string }>(subscriptionObj);

      subscription('reset');

      expect(subscriptionObj.get).not.toHaveBeenCalled();
      expect(subscriptionObj.set).not.toHaveBeenCalled();
      expect(subscriptionObj.reset).toHaveBeenCalledTimes(1);
    });
  });
});

const mockSubscriptionObject = () => ({
  get: jest.fn(),
  set: jest.fn(),
  reset: jest.fn(),
});
