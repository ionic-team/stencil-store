
export type SetEventHandler<StoreType> = (key: keyof StoreType, newValue: any, oldValue: any) => void;
export type GetEventHandler<StoreType> = (key: keyof StoreType) => void;
export type ResetEventHandler = () => void;

export interface EventHandlerFunction<StoreType> {
  (eventName: 'set', callback: SetEventHandler<StoreType>): void;
  (eventName: 'get', callback: GetEventHandler<StoreType>): void;
  (eventName: 'reset', callback: ResetEventHandler): void;
}

export interface StoreSubscription<StoreType> {
  <KeyFromStoreType extends keyof StoreType>(
    action: 'set',
    key: KeyFromStoreType,
    newValue: StoreType[KeyFromStoreType],
    oldValue: StoreType[KeyFromStoreType]
  ): void;
  <KeyFromStoreType extends keyof StoreType>(action: 'get', key: KeyFromStoreType): void;
  (action: 'reset'): void;
}

export interface StoreSubscriptionObject<StoreType> {
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
  state: T;
  get: Getter<T>;
  set: Setter<T>;
  on: EventHandlerFunction<T>;
  reset: () => void;
  subscribe(subscription: StoreSubscriptionObject<T>): void;
}

export interface ComputedReturn<T> {
  (gen: (states: T) => void): void;
}
