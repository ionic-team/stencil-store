import { OnHandler, OnChangeHandler, Subscription, ObservableMap, Handlers } from './types';

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: T
): ObservableMap<T> => {
  let states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const handlers: Handlers<T> = {
    get: [],
    set: [],
    reset: [],
  };

  const reset = (): void => {
    states = new Map<string, any>(Object.entries(defaultState ?? {}));

    handlers.reset.forEach((cb) => cb());
  };

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    handlers.get.forEach((cb) => cb(propName));

    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    const oldValue = states.get(propName);
    if (oldValue !== value || typeof value === 'object') {
      states.set(propName, value);

      handlers.set.forEach((cb) => cb(propName, value, oldValue));
    }
  };

  const state = (typeof Proxy === 'undefined'
    ? {}
    : new Proxy(defaultState, {
        get(_, propName) {
          return get(propName as any);
        },
        ownKeys(_) {
          return Array.from(states.keys());
        },
        getOwnPropertyDescriptor() {
          return {
            enumerable: true,
            configurable: true,
          };
        },
        has(_, propName) {
          return states.has(propName as any);
        },
        set(_, propName, value) {
          set(propName as any, value);
          return true;
        },
      })) as T;

  const on: OnHandler<T> = (eventName, callback) => {
    handlers[eventName].push(callback);
    return () => {
      removeFromArray(handlers[eventName], callback);
    };
  };

  const onChange: OnChangeHandler<T> = (propName, cb) => {
    const unSet = on('set', (key, newValue) => {
      if (key === propName) {
        cb(newValue);
      }
    });
    const unReset = on('reset', () => cb(defaultState[propName]));
    return () => {
      unSet();
      unReset();
    };
  };

  const use = (...subscriptions: Subscription<T>[]): void =>
    subscriptions.forEach((subscription) => {
      if (subscription.set) {
        on('set', subscription.set);
      }
      if (subscription.get) {
        on('get', subscription.get);
      }
      if (subscription.reset) {
        on('reset', subscription.reset);
      }
    });

  return {
    state,
    get,
    set,
    on,
    onChange,
    use,
    reset,
  };
};

const removeFromArray = (array: any[], item: any) => {
  const index = array.indexOf(item);
  if (index >= 0) {
    array[index] = array[array.length - 1];
    array.length--;
  }
};
