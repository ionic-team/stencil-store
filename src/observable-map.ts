import { OnHandler, OnChangeHandler, Subscription, ObservableMap, Handlers } from './types';

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: T,
  shouldUpdate: (newV: any, oldValue, prop: keyof T) => boolean = (a, b) => a !== b
): ObservableMap<T> => {
  let states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const handlers: Handlers<T> = {
    dispose: [],
    get: [],
    set: [],
    reset: [],
    delete: [],
  };

  const reset = (): void => {
    states = new Map<string, any>(Object.entries(defaultState ?? {}));

    handlers.reset.forEach((cb) => cb());
  };

  const dispose = (): void => {
    // Call first dispose as resetting the state would
    // cause less updates ;)
    handlers.dispose.forEach((cb) => cb());
    reset();
  };

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    handlers.get.forEach((cb) => cb(propName));

    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    const oldValue = states.get(propName);
    if (shouldUpdate(value, oldValue, propName)) {
      states.set(propName, value);

      handlers.set.forEach((cb) => cb(propName, value, oldValue));
    }
  };

  const deleteProperty = <P extends keyof T>(propName: P & string) => {
    const success = states.delete(propName);

    if (success) {
      handlers.delete.forEach((cb) => cb(propName));
    }

    return success;
  }

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
        deleteProperty(_, propName) {
          return deleteProperty(propName as any);
        }
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
      if (subscription.delete) {
        on('delete', subscription.delete);
      }
    });

  return {
    state,
    get,
    set,
    delete: deleteProperty,
    on,
    onChange,
    use,
    dispose,
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
