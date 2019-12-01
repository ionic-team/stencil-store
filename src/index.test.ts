import { createStore } from './index';

describe('computed', () => {
  test('runs as soon as computed is called', () => {
    const { computed } = createStore({});
    const computedCallback = jest.fn();

    computed(computedCallback);

    expect(computedCallback).toHaveBeenCalledTimes(1);
  });

  test('modifies the actual state', () => {
    const { state, computed } = createStore({
      hello: 'hola',
      name: 'Sergio',
      greeting: '',
    });

    computed(state => {
      state.greeting = `${state.hello}, ${state.name}`;
    });

    expect(state.greeting).toBe('hola, Sergio');
  });

  test('only calls computeds that depend on that property', () => {
    const { state, computed } = createStore({
      hello: 'hola',
      name: 'Sergio',
      age: 32,
      greeting: '',
      personInfo: '',
    });
    const computedFromHelloAndName = jest.fn().mockImplementation(state => state.greeting = `${state.hello}, ${state.name}`);
    const computedFromNameAndAge = jest.fn().mockImplementation(state => state.personInfo = `${state.name} (${state.age})`);

    computed(computedFromHelloAndName);
    computed(computedFromNameAndAge);

    computedFromHelloAndName.mockClear();
    computedFromNameAndAge.mockClear();

    state.hello = 'ola';

    expect(computedFromHelloAndName).toHaveBeenCalledTimes(1);
    expect(computedFromNameAndAge).not.toHaveBeenCalled();
    computedFromHelloAndName.mockClear();

    state.age = 28; // I look younger, anyway ;P

    expect(computedFromHelloAndName).not.toHaveBeenCalled();
    expect(computedFromNameAndAge).toHaveBeenCalledTimes(1);
    computedFromNameAndAge.mockClear();

    state.name = 'Manu';

    expect(computedFromHelloAndName).toHaveBeenCalledTimes(1);
    expect(computedFromNameAndAge).toHaveBeenCalledTimes(1);
  })
});

describe('reset', () => {
  test('returns all variable to their original state', () => {
    const { reset, state } = createStore({
      hola: 'hola',
      name: 'Sergio'
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
    const { reset, state } = createStore<Record<string, string>>({});

    state.hola = 'hello';

    expect(state).toHaveProperty('hola');
    expect(state.hola).toBe('hello');

    reset();

    expect(state).not.toHaveProperty('hola');
  });

  test('calls computeds', () => {
    const { computed, reset } = createStore({ hola: 'hola' });
    const firstComputed = jest.fn().mockImplementation(s => s.hola);
    const secondComputed = jest.fn().mockImplementation(s => s.hola);
    computed(firstComputed);
    computed(secondComputed);

    firstComputed.mockClear();
    secondComputed.mockClear();

    reset();

    expect(firstComputed).toHaveBeenCalled();
    expect(secondComputed).toHaveBeenCalled();
  });

  test('calls reset subscriptions (fn)', () => {
    const { subscribe, reset } = createStore({ hola: 'hola' });
    const subscription = jest.fn();
    subscribe(subscription);

    reset();

    expect(subscription).toHaveBeenCalledWith('reset', expect.objectContaining({ hola: 'hola' }));
  });

  test('calls reset subscriptions (object)', () => {
    const { subscribe, reset } = createStore({ hola: 'hola' });
    const subscription = jest.fn();
    subscribe({
      reset: subscription
    });

    reset();

    expect(subscription).toHaveBeenCalledWith(expect.objectContaining({ hola: 'hola' }));
  });
});

describe.each([
  ['proxy', (state, _get, property) => state[property]],
  ['get fn', (_state, get, property) => get(property)]
] as [
  string,
  <T, K extends keyof T>(s: T, get: (prop: K) => T[K], prop: K) => T[K],
][])('get (%s)', (_, getter) => {
  test('returns the value for the property in the store', () => {
    const { get, state } = createStore({
      hola: 'hello'
    });

    expect(getter(state, get, 'hola')).toBe('hello');
  });

  test('returns the modified value in a computed', () => {
    const { computed, get, state } = createStore({
      hola: 'hello',
      ru: '',
    });
    computed(states => states.ru = `${states.hola}, ${states.hola}, ${states.hola}`);

    expect(getter(state, get, 'ru')).toBe('hello, hello, hello');
  });

  test('returns the modified value after being set', () => {
    const { get, state } = createStore({
      hola: 'hello',
    });

    state.hola = 'ola';

    expect(getter(state, get, 'hola')).toBe('ola');
  });

  test('calls subscriptions (fn)', () => {
    const { get, subscribe, state } = createStore({
      hola: 'hello'
    });
    const subscription = jest.fn();
    subscribe(subscription);

    getter(state, get, 'hola');

    expect(subscription).toHaveBeenCalledWith('get', state, 'hola');
  });

  test('calls subscriptions (object)', () => {
    const { get, subscribe, state } = createStore({
      hola: 'hello'
    });
    const subscription = jest.fn();
    subscribe({
      get: subscription
    });

    getter(state, get, 'hola');

    expect(subscription).toHaveBeenCalledWith(state, 'hola');
  });
});

describe.each([
  ['proxy', (state, _set, prop, value) => state[prop] = value],
  ['set fn', (_state, set, prop, value) => set(prop, value)]
] as [
  string,
  <T, K extends keyof T>(s: T, set: (prop: K, value: T[K]) => void, prop: K, value: T[K]) => void
][])('set (%s)', (_, setter) => {

  test('sets the value for a property', () => {
    const { set, state } = createStore({
      hola: 'hello'
    });

    setter(state, set, 'hola', 'ola');

    expect(state.hola).toBe('ola');
  });

  test('calls subscriptions (fn)', () => {
    const { set, subscribe, state } = createStore({
      hola: 'hello'
    });
    const subscription = jest.fn();
    subscribe(subscription);

    setter(state, set, 'hola', 'ola');

    expect(subscription).toHaveBeenCalledWith('set', state, 'hola', 'ola', 'hello');
  });

  test('calls subscriptions (object)', () => {
    const { set, subscribe, state } = createStore({
      hola: 'hello'
    });
    const subscription = jest.fn();
    subscribe({
      set: subscription
    });

    setter(state, set, 'hola', 'ola');

    expect(subscription).toHaveBeenCalledWith(state, 'hola', 'ola', 'hello');
  });
});