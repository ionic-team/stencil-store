export interface Handlers<T> {
  set: SetEventHandler<T>[];
  get: GetEventHandler<T>[];
  reset: ResetEventHandler[];
}

export type SetEventHandler<StoreType> = (
  key: keyof StoreType,
  newValue: any,
  oldValue: any
) => void;
export type GetEventHandler<StoreType> = (key: keyof StoreType) => void;
export type ResetEventHandler = () => void;

export interface OnHandler<StoreType> {
  (eventName: 'set', callback: SetEventHandler<StoreType>): void;
  (eventName: 'get', callback: GetEventHandler<StoreType>): void;
  (eventName: 'reset', callback: ResetEventHandler): void;
}

export interface OnChangeHandler<StoreType> {
  <Key extends keyof StoreType>(propName: Key, cb: (newValue: StoreType[Key]) => void): void;
}

export interface Subscription<StoreType> {
  get?<KeyFromStoreType extends keyof StoreType>(key: KeyFromStoreType): void;
  set?<KeyFromStoreType extends keyof StoreType>(
    key: KeyFromStoreType,
    newValue: StoreType[KeyFromStoreType],
    oldValue: StoreType[KeyFromStoreType]
  ): void;
  reset?(): void;
}

export interface Getter<T> {
  <P extends keyof T>(propName: P & string): T[P];
}

export interface Setter<T> {
  <P extends keyof T>(propName: P & string, value: T[P]): void;
}

export interface ObservableMap<T> {
  /**
   * Proxied object that will detect dependencies and call
   * the subscriptions and computed properties.
   *
   * If available, it will detect from which Stencil Component
   * it was called and rerender it when the property changes.
   *
   * Note: Proxy objects are not supported by IE11 (not even with a polyfill)
   * so you need to use the store.get and store.set methods of the API if you wish to support IE11.
   *
   */
  state: T;

  /**
   * Only useful if you need to support IE11.
   *
   * @example
   * const { state, get } = createStore({ hola: 'hello', adios: 'goodbye' });
   * console.log(state.hola); // If you don't need to support IE11, use this way.
   * console.log(get('hola')); // If you need to support IE11, use this other way.
   */
  get: Getter<T>;

  /**
   * Only useful if you need to support IE11.
   *
   * @example
   * const { state, get } = createStore({ hola: 'hello', adios: 'goodbye' });
   * state.hola = 'ola'; // If you don't need to support IE11, use this way.
   * set('hola', 'ola')); // If you need to support IE11, use this other way.
   */
  set: Setter<T>;

  /**
   * Register a event listener, you can listen to `set`, `get` and `reset` events.
   *
   * @example
   * store.on('set', (prop, value) => {
   *   console.log(`Prop ${prop} changed to: ${value}`);
   * });
   */
  on: OnHandler<T>;

  /**
   * Easily listen for value changes of the specified key.
   */
  onChange: OnChangeHandler<T>;

  /**
   * Resets the state to its original state.
   */
  reset(): void;

  /**
   * Registers a subscription that will be called whenever the user gets, sets, or
   * resets a value.
   */
  use(...plugins: Subscription<T>[]): void;
}
