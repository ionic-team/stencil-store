export interface StoreSubscription<StoreType> {
  <KeyFromStoreType extends keyof StoreType>(
    action: 'set',
    state: StoreType,
    key: KeyFromStoreType,
    newValue: StoreType[KeyFromStoreType],
    oldValue: StoreType[KeyFromStoreType]
  ): void;
  <KeyFromStoreType extends keyof StoreType>(
    action: 'get',
    state: StoreType,
    key: KeyFromStoreType
  ): void;
  (action: 'reset', state: StoreType): void;
}

export interface StoreSubscriptionObject<StoreType> {
  get?<KeyFromStoreType extends keyof StoreType>(state: StoreType, key: KeyFromStoreType): void;
  set?<KeyFromStoreType extends keyof StoreType>(
    state: StoreType,
    key: KeyFromStoreType,
    newValue: StoreType[KeyFromStoreType],
    oldValue: StoreType[KeyFromStoreType]
  ): void;
  reset?(state: StoreType): void;
}

export interface Getter<T> {
  <P extends keyof T>(propName: P & string): T[P];
}

export interface Setter<T> {
  <P extends keyof T>(propName: P & string, value: T[P]): void;
}

export interface ObservableMap<T> {
  state: T;
  get: Getter<T>;
  set: Setter<T>;
  reset: () => void;
  subscribe(subscription: StoreSubscription<T> | StoreSubscriptionObject<T>): void;
}

export interface ComputedReturn<T> {
  (gen: (states: T) => void): void;
}
