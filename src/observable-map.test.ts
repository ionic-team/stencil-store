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

  test('calls on', () => {
    const { reset, on } = createObservableMap({ hola: 'hello' });
    const subscription = jest.fn();

    on('reset', subscription);

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

    test('calls on', () => {
      const { get, on, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      on('get', subscription);

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

    test('calls on', () => {
      const { set, on, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      on('set', subscription);

      setter(state, set, 'hola', 'ola');

      expect(subscription).toHaveBeenCalledWith('hola', 'ola', 'hello');
    });

    test('calls onChange', () => {
      const { set, onChange, state } = createObservableMap({
        hola: 'hello',
      });
      const subscription = jest.fn();
      onChange('hola', subscription);

      setter(state, set, 'hola', 'ola');

      expect(subscription).toHaveBeenCalledWith('ola');
    });

    test('enumerable keys', () => {
      const { state } = createObservableMap<any>({});
      expect(Object.keys(state)).toEqual([]);
      state.hello = 'hola';
      expect(Object.keys(state)).toEqual(['hello']);
      expect(Object.getOwnPropertyNames(state)).toEqual(['hello']);
      const copy = { ...state };
      expect(copy).toEqual({ hello: 'hola' });
    });

    test('in operator', () => {
      const { state } = createObservableMap<any>({});
      expect('hello' in state).toBe(false);
      state.hello = 'hola';
      expect('hello' in state).toBe(true);
    });
  }
);

test('unregister events', () => {
  const { reset, state, on, onChange } = createObservableMap({
    hola: 'hola',
    name: 'Sergio',
  });
  const SET = jest.fn();
  const GET = jest.fn();
  const RESET = jest.fn();
  const CHANGE = jest.fn();

  const unset = on('set', SET);
  const unget = on('get', GET);
  const unreset = on('reset', RESET);
  const unChange = onChange('hola', CHANGE);

  state.hola = 'hola2';
  state.name = 'hola2';
  expect(SET).toHaveBeenCalledTimes(2);
  unset();
  state.hola = 'hola3';
  expect(SET).toHaveBeenCalledTimes(2);

  state.hola;
  state.name;
  expect(GET).toHaveBeenCalledTimes(2);
  unget();
  state.name;
  expect(GET).toHaveBeenCalledTimes(2);

  reset();
  reset();
  expect(RESET).toHaveBeenCalledTimes(2);
  unreset();
  reset();
  expect(RESET).toHaveBeenCalledTimes(2);

  expect(CHANGE).toHaveBeenCalledTimes(5);
  unChange();
  reset();
  state.hola = 'hola';
  expect(CHANGE).toHaveBeenCalledTimes(5);
});
