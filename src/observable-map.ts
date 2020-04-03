import {
  OnHandler,
  OnChangeHandler,
  StoreSubscriptionObject,
  ObservableMap,
  SetEventHandler,
  GetEventHandler,
  ResetEventHandler,
} from './types';

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: T
): ObservableMap<T> => {
  let states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const setListeners: SetEventHandler<T>[] = [];
  const getListeners: GetEventHandler<T>[] = [];
  const resetListeners: ResetEventHandler[] = [];

  const reset = (): void => {
    states = new Map<string, any>(Object.entries(defaultState ?? {}));

    resetListeners.forEach((cb) => cb());
  };

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    getListeners.forEach((cb) => cb(propName));

    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    const oldValue = states.get(propName);
    if (oldValue !== value || typeof value === 'object') {
      states.set(propName, value);

      setListeners.forEach((cb) => cb(propName, value, oldValue));
    }
  };

  const state = (window.Proxy === undefined
    ? {}
    : new Proxy(defaultState, {
        get(_, propName) {
          return get(propName as any);
        },
        set(_, propName, value) {
          set(propName as any, value);
          return true;
        },
      })) as T;

  const on: OnHandler<T> = (eventName, callback) => {
    let listeners: any[] = setListeners;
    if (eventName === 'set') {
      listeners = setListeners;
    } else if (eventName === 'get') {
      listeners = getListeners;
    } else if (eventName === 'reset') {
      listeners = resetListeners;
    } else {
      throw new Error(`Unknown event ${eventName}`);
    }
    listeners.push(callback);
  };

  const onChange: OnChangeHandler<T> = (propName, cb) => {
    on('set', (key, newValue) => {
      if (key === propName) {
        cb(newValue);
      }
    });
    on('reset', () => {
      cb(defaultState[propName]);
    });
  };

  const use = (...subscriptions: StoreSubscriptionObject<T>[]): void => {
    subscriptions.forEach(subscribe);
  };

  const subscribe = (subscription: StoreSubscriptionObject<T>): void => {
    if (subscription.set) {
      on('set', subscription.set);
    }
    if (subscription.get) {
      on('get', subscription.get);
    }
    if (subscription.reset) {
      on('reset', subscription.reset);
    }
  };

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
