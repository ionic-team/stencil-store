import { StoreSubscription, StoreSubscriptionObject } from './types';

export const appendToMap = <K, V>(map: Map<K, V[]>, propName: K, value: V) => {
  const items = map.get(propName);
  if (!items) {
    map.set(propName, [value]);
  } else if (!items.includes(value)) {
    items.push(value);
  }
};

export const toSubscription = <T>(
  subscription: StoreSubscription<T> | StoreSubscriptionObject<T>
): StoreSubscription<T> => {
  if (typeof subscription === 'function') {
    return subscription;
  }

  const hasGet = 'get' in subscription;
  const hasSet = 'set' in subscription;
  const hasReset = 'reset' in subscription;

  return <K extends keyof T>(
    action: 'get' | 'set' | 'reset',
    propNameOrStore?: K,
    newValue?: T[K],
    oldValue?: T[K]
  ) => {
    switch (action) {
      case 'get':
        return hasGet && subscription.get(propNameOrStore);
      case 'set':
        return hasSet && subscription.set(propNameOrStore, newValue, oldValue);
      case 'reset':
        return hasReset && subscription.reset();
    }
  };
};

export const debounce = <T extends (...args: any) => any>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(args);
    }, ms);
  };
};

export const forMs = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
