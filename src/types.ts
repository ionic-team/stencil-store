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
