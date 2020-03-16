import { EventHandlerFunction, StoreSubscriptionObject, ObservableMap, SetEventHandler, GetEventHandler, ResetEventHandler } from './types';

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: T
): ObservableMap<T> => {
  let states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const setListeners: SetEventHandler<T>[] = [];
  const getListeners: GetEventHandler<T>[] = [];
  const resetListeners: ResetEventHandler[] = [];

  const reset = (): void => {
    states = new Map<string, any>(Object.entries(defaultState ?? {}));

    resetListeners.forEach(cb => cb());
  };

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    getListeners.forEach(cb => cb(propName));

    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    const oldValue = states.get(propName);
    if (oldValue !== value || typeof value === 'object') {
      states.set(propName, value);

      setListeners.forEach(cb => cb(propName, value, oldValue));
    }
  };

  const state = new Proxy(defaultState, {
    get(_, propName) {
      return get(propName as any);
    },
    set(_, propName, value) {
      set(propName as any, value);
      return true;
    },
  });

  const on: EventHandlerFunction<T> = (eventName, callback) => {
    let listeners: any[] = setListeners;
    if (eventName === 'get') {
      listeners = getListeners;
    } else if (eventName === 'reset') {
      listeners = resetListeners;
    }
    listeners.push(callback);
  }

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
    /**
     * Proxied object that will detect dependencies and call
     * the subscriptions and computed properties.
     *
     * If available, it will detect from which Stencil Component
     * it was called and rerender it when the property changes.
     */
    state,

    /**
     * Only useful if you need to support IE11.
     *
     * @example
     * const { state, get } = createStore({ hola: 'hello', adios: 'goodbye' });
     * console.log(state.hola); // If you don't need to support IE11, use this way.
     * console.log(get('hola')); // If you need to support IE11, use this other way.
     */
    get,

    /**
     * Only useful if you need to support IE11.
     *
     * @example
     * const { state, get } = createStore({ hola: 'hello', adios: 'goodbye' });
     * state.hola = 'ola'; // If you don't need to support IE11, use this way.
     * set('hola', 'ola')); // If you need to support IE11, use this other way.
     */
    set,

    /**
     * Register a event listener, you can listen to `set`, `get` and `reset` events.
     */
    on,

    /**
     * Registers a subscription that will be called whenever the user gets, sets, or
     * resets a value.
     */
    subscribe,

    /**
     * Resets the state to its original state.
     */
    reset,
  };
};
