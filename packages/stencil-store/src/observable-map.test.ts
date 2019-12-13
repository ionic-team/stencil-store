import { createObservableMap } from './observable-map';

describe('reset', () => {
  test('returns all variable to their original state', () => {
    const { reset, state } = createObservableMap({
      hola: 'hola',
      name: 'Sergio',
    });

    state.hola = 'hello';
    state.name = 'Manu';

    expect(state.hola).toBe('hello');
    expect(state.name).toBe('Manu');

    reset();

    expect(state.hola).toBe('hola');
    expect(state.name).toBe('Sergio');
  });

  test('extra properties get removed', () => {
    const { reset, state } = createObservableMap<Record<string, string>>({});

    state.hola = 'hello';

    expect(state).toHaveProperty('hola');
    expect(state.hola).toBe('hello');

    reset();

    expect(state).not.toHaveProperty('hola');
  });

  test('calls reset subscriptions (fn)', () => {
    const { subscribe, reset } = createObservableMap({ hola: 'hola' });
    const subscription = jest.fn();
    subscribe(subscription);

    reset();

    expect(subscription).toHaveBeenCalledWith('reset', expect.objectContaining({ hola: 'hola' }));
  });

  test('calls reset subscriptions (object)', () => {
    const { subscribe, reset } = createObservableMap({ hola: 'hola' });
    const subscription = jest.fn();
    subscribe({
      reset: subscription,
    });

    reset();

    expect(subscription).toHaveBeenCalledTimes(1);
  });
});

describe.each([
  ['proxy', (state, _get, property) => state[property]],
  ['get fn', (_state, get, property) => get(property)],
] as [string, <T, K extends keyof T>(s: T, get: (prop: K) => T[K], prop: K) => T[K]][])(
  'get (%s)',
  (_, getter) => {
    test('returns the value for the property in the store', () => {
      const { get, state } = createObservableMap({
        hola: 'hello',
      });

      expect(getter(state, get, 'hola')).toBe('hello');
    });

    test('returns the modified value after being set', () => {
      const { get, state } = createObservableMap({
        hola: 'hello',
      });

      state.hola = 'ola';

      expect(getter(state, get, 'hola')).toBe('ola');
    });

    test('calls subscriptions (fn)', () => {
      const { get, subscribe, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      subscribe(subscription);

      getter(state, get, 'hola');

      expect(subscription).toHaveBeenCalledWith('get', 'hola');
    });

    test('calls subscriptions (object)', () => {
      const { get, subscribe, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      subscribe({
        get: subscription,
      });

      getter(state, get, 'hola');

      expect(subscription).toHaveBeenCalledWith('hola');
    });
  }
);

describe.each([
  ['proxy', (state, _set, prop, value) => (state[prop] = value)],
  ['set fn', (_state, set, prop, value) => set(prop, value)],
] as [string, <T, K extends keyof T>(s: T, set: (prop: K, value: T[K]) => void, prop: K, value: T[K]) => void][])(
  'set (%s)',
  (_, setter) => {
    test('sets the value for a property', () => {
      const { set, state } = createObservableMap({
        hola: 'hello',
      });

      setter(state, set, 'hola', 'ola');

      expect(state.hola).toBe('ola');
    });

    test('calls subscriptions (fn)', () => {
      const { set, subscribe, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      subscribe(subscription);

      setter(state, set, 'hola', 'ola');

      expect(subscription).toHaveBeenCalledWith('set', 'hola', 'ola', 'hello');
    });

    test('calls subscriptions (object)', () => {
      const { set, subscribe, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      subscribe({
        set: subscription,
      });

      setter(state, set, 'hola', 'ola');

      expect(subscription).toHaveBeenCalledWith('hola', 'ola', 'hello');
    });
  }
);
