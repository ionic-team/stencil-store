import { createObservableMap } from './observable-map';

describe.each([
  ['reset', 'reset'],
  ['dispose calls reset', 'dispose'],
] as [string, 'reset' | 'dispose'][])('%s', (_, methodName) => {
  test('returns all variable to their original state', () => {
    const { [methodName]: method, state } = createObservableMap({
      hola: 'hola',
      name: 'Sergio',
    });

    state.hola = 'hello';
    state.name = 'Manu';

    expect(state.hola).toBe('hello');
    expect(state.name).toBe('Manu');

    method();

    expect(state.hola).toBe('hola');
    expect(state.name).toBe('Sergio');
  });

  test('extra properties get removed', () => {
    const { [methodName]: method, state } = createObservableMap<Record<string, string>>({});

    state.hola = 'hello';

    expect(state).toHaveProperty('hola');
    expect(state.hola).toBe('hello');

    method();

    expect(state).not.toHaveProperty('hola');
  });

  test('calls on', () => {
    const { [methodName]: method, on } = createObservableMap({ hola: 'hello' });
    const subscription = jest.fn();

    on('reset', subscription);

    method();

    expect(subscription).toHaveBeenCalledTimes(1);
  });
});

describe('dispose', () => {
  test('calls on', () => {
    const { dispose, on } = createObservableMap({ hola: 'hello' });
    const subscription = jest.fn();

    on('dispose', subscription);

    dispose();

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

test('default change detector', () => {
  const store = createObservableMap({
    str: 'hola',
  });
  const SET = jest.fn();
  store.on('set', SET);
  store.state.str = 'hola';
  expect(SET).not.toBeCalled();
  store.state.str = 'hola2';
  expect(SET).toBeCalledWith('str', 'hola2', 'hola');
});

test('custom change detector, values', () => {
  const comparer = jest.fn((a, b) => a !== b);
  const store = createObservableMap(
    {
      str: 'hola',
    },
    comparer
  );
  store.state.str = 'hola';
  expect(comparer).toBeCalledWith('hola', 'hola', 'str');
  store.state.str = 'hola2';
  expect(comparer).toBeCalledWith('hola2', 'hola', 'str');
  store.state.str = 'hola3';
  expect(comparer).toBeCalledWith('hola3', 'hola2', 'str');
});

test('custom change detector, prevent all mutations', () => {
  const store = createObservableMap(
    {
      str: 'hola',
    },
    () => false
  );
  const SET = jest.fn();
  store.on('set', SET);
  store.state.str = 'hola';
  expect(SET).not.toBeCalled();
  store.state.str = 'hola2';
  expect(SET).not.toBeCalled();
  expect(store.state.str).toEqual('hola');
});

describe('use subscriptions', () => {
  test('get is called whenever we get a prop', () => {
    const store = createObservableMap({ str: 'hola' });
    const get = jest.fn();
    store.use({ get });

    store.state.str;

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('str');
  });

  test('get is unregistered', () => {
    const store = createObservableMap({ str: 'hola' });
    const get = jest.fn();
    const unregister = store.use({ get });
    store.state.str;
    expect(get).toHaveBeenCalledTimes(1);
    get.mockClear();

    unregister();
    store.state.str;

    expect(get).not.toHaveBeenCalled();
  });

  test('set is called whenever we set a prop', () => {
    const store = createObservableMap({ str: 'hola' });
    const set = jest.fn();
    store.use({ set });

    store.state.str = 'adios';

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith('str', 'adios', 'hola');
  });

  test('set is unregistered', () => {
    const store = createObservableMap({ str: 'hola' });
    const set = jest.fn();
    const unregister = store.use({ set });
    store.state.str = 'adios';
    expect(set).toHaveBeenCalledTimes(1);
    set.mockClear();

    unregister();
    store.state.str = 'hello';

    expect(set).not.toHaveBeenCalled();
  });

  test('reset is called when we reset the store', () => {
    const store = createObservableMap({ str: 'hola' });
    const reset = jest.fn();
    store.use({ reset });

    store.reset();

    expect(reset).toHaveBeenCalledTimes(1);
  });

  test('reset is unregistered', () => {
    const store = createObservableMap({ str: 'hola' });
    const reset = jest.fn();
    const unregister = store.use({ reset });
    store.reset();
    expect(reset).toHaveBeenCalledTimes(1);
    reset.mockClear();

    unregister();
    store.reset();

    expect(reset).not.toHaveBeenCalled();
  });

  test('dispose is called when we dispose the store', () => {
    const store = createObservableMap({ str: 'hola' });
    const dispose = jest.fn();
    store.use({ dispose });

    store.dispose();

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test('dispose is unregistered', () => {
    const store = createObservableMap({ str: 'hola' });
    const dispose = jest.fn();
    const unregister = store.use({ dispose });
    store.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
    dispose.mockClear();

    unregister();
    store.dispose();

    expect(dispose).not.toHaveBeenCalled();
  });

  test('subscription with several properties subscribes to all of them', () => {
    const store = createObservableMap({ str: 'hola' });
    const subscription = {
      dispose: jest.fn(),
      get: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
    };
    store.use(subscription);

    store.state.str;
    expect(subscription.get).toHaveBeenCalledTimes(1);

    store.state.str = 'adios';
    expect(subscription.set).toHaveBeenCalledTimes(1);

    store.reset();
    expect(subscription.reset).toHaveBeenCalledTimes(1);

    store.dispose();
    expect(subscription.dispose).toHaveBeenCalledTimes(1);
  });

  test('subscription with several properties can be unregistered', () => {
    const store = createObservableMap({ str: 'hola' });
    const subscription = {
      dispose: jest.fn(),
      get: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
    };
    const unregister = store.use(subscription);

    store.state.str;
    expect(subscription.get).toHaveBeenCalledTimes(1);
    store.state.str = 'adios';
    expect(subscription.set).toHaveBeenCalledTimes(1);
    store.reset();
    expect(subscription.reset).toHaveBeenCalledTimes(1);
    store.dispose();
    expect(subscription.dispose).toHaveBeenCalledTimes(1);
    jest.clearAllMocks();

    unregister();

    store.state.str;
    expect(subscription.get).not.toHaveBeenCalled();
    store.state.str = 'adios';
    expect(subscription.set).not.toHaveBeenCalled();
    store.reset();
    expect(subscription.reset).not.toHaveBeenCalled();
    store.dispose();
    expect(subscription.dispose).not.toHaveBeenCalled();
  });

  test('use can be passed several subscriptions', () => {
    const store = createObservableMap({ str: 'hola' });
    const subscription = {
      dispose: jest.fn(),
      get: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
    };
    const subscription2 = {
      dispose: jest.fn(),
      get: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
    };
    store.use(subscription, subscription2);

    store.state.str;
    expect(subscription.get).toHaveBeenCalledTimes(1);
    expect(subscription2.get).toHaveBeenCalledTimes(1);

    store.state.str = 'adios';
    expect(subscription.set).toHaveBeenCalledTimes(1);
    expect(subscription2.set).toHaveBeenCalledTimes(1);

    store.reset();
    expect(subscription.reset).toHaveBeenCalledTimes(1);
    expect(subscription2.reset).toHaveBeenCalledTimes(1);

    store.dispose();
    expect(subscription.dispose).toHaveBeenCalledTimes(1);
    expect(subscription2.dispose).toHaveBeenCalledTimes(1);
  });

  test('use can be passed several subscriptions and unregisters them all', () => {
    const store = createObservableMap({ str: 'hola' });
    const subscription = {
      dispose: jest.fn(),
      get: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
    };
    const subscription2 = {
      dispose: jest.fn(),
      get: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
    };
    const unregister = store.use(subscription, subscription2);
    store.state.str;
    expect(subscription.get).toHaveBeenCalledTimes(1);
    expect(subscription2.get).toHaveBeenCalledTimes(1);
    store.state.str = 'adios';
    expect(subscription.set).toHaveBeenCalledTimes(1);
    expect(subscription2.set).toHaveBeenCalledTimes(1);
    store.reset();
    expect(subscription.reset).toHaveBeenCalledTimes(1);
    expect(subscription2.reset).toHaveBeenCalledTimes(1);
    store.dispose();
    expect(subscription.dispose).toHaveBeenCalledTimes(1);
    expect(subscription2.dispose).toHaveBeenCalledTimes(1);
    jest.clearAllMocks();

    unregister();

    store.state.str;
    expect(subscription.get).not.toHaveBeenCalled();
    expect(subscription2.get).not.toHaveBeenCalled();
    store.state.str = 'adios';
    expect(subscription.set).not.toHaveBeenCalled();
    expect(subscription2.set).not.toHaveBeenCalled();
    store.reset();
    expect(subscription.reset).not.toHaveBeenCalled();
    expect(subscription2.reset).not.toHaveBeenCalled();
    store.dispose();
    expect(subscription.dispose).not.toHaveBeenCalled();
    expect(subscription2.dispose).not.toHaveBeenCalled();
  });
});

test('forceUpdate', () => {
  const store = createObservableMap({
    str: 'hola',
  });
  const SET = jest.fn();
  store.on('set', SET);
  store.forceUpdate('str');
  store.forceUpdate('str');
  expect(SET).toHaveBeenCalledTimes(2);
  expect(SET).toBeCalledWith('str', 'hola', 'hola');
});
