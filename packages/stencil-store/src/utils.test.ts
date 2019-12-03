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
      const subscription = toSubscription(subscriptionObj);
      const state = { hola: 'hola' };

      subscription('get', state, 'hola');

      expect(subscriptionObj.get).toHaveBeenCalledWith(state, 'hola');
      expect(subscriptionObj.set).not.toHaveBeenCalled();
      expect(subscriptionObj.reset).not.toHaveBeenCalled();
    });

    test('calls set method', () => {
      const subscriptionObj = mockSubscriptionObject();
      const subscription = toSubscription(subscriptionObj);
      const state = { hola: 'hola' };

      subscription('set', state, 'hola', 'ola', 'hola');

      expect(subscriptionObj.get).not.toHaveBeenCalled();
      expect(subscriptionObj.set).toHaveBeenCalledWith(state, 'hola', 'ola', 'hola');
      expect(subscriptionObj.reset).not.toHaveBeenCalled();
    });

    test('calls reset method', () => {
      const subscriptionObj = mockSubscriptionObject();
      const subscription = toSubscription(subscriptionObj);
      const state = { hola: 'hola' };

      subscription('reset', state);

      expect(subscriptionObj.get).not.toHaveBeenCalled();
      expect(subscriptionObj.set).not.toHaveBeenCalled();
      expect(subscriptionObj.reset).toHaveBeenCalledWith(state);
    });
  });
});

const mockSubscriptionObject = () => ({
  get: jest.fn(),
  set: jest.fn(),
  reset: jest.fn(),
});
