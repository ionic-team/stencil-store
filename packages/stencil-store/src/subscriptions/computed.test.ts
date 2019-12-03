import { createObservableMap } from '../observable-map';
import { ObservableMap } from '../types';
import { computedSubscription } from './computed';

describe('computed', () => {
  test('runs as soon as computed is called', () => {
    const { computed } = createMapWithComputed({});
    const computedCallback = jest.fn();

    computed(computedCallback);

    expect(computedCallback).toHaveBeenCalledTimes(1);
  });

  test('modifies the actual state', () => {
    const { state, computed } = createMapWithComputed({
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
    const { state, computed } = createMapWithComputed({
      hello: 'hola',
      name: 'Sergio',
      age: 32,
      greeting: '',
      personInfo: '',
    });
    const computedFromHelloAndName = jest
      .fn()
      .mockImplementation(state => (state.greeting = `${state.hello}, ${state.name}`));
    const computedFromNameAndAge = jest
      .fn()
      .mockImplementation(state => (state.personInfo = `${state.name} (${state.age})`));

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
  });

  test('reset calls computed properties', () => {
    const { computed, reset } = createMapWithComputed({ hola: 'hola' });
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

  test.each([
    ['proxy', (state, _get, property) => state[property]],
    ['get fn', (_state, get, property) => get(property)],
  ] as [string, <T, K extends keyof T>(s: T, get: (prop: K) => T[K], prop: K) => T[K]][])(
    '(%s) returns the modified state in a computed',
    (_, getter) => {
      const { computed, get, state } = createMapWithComputed({
        hola: 'hello',
        ru: '',
      });
      computed(states => (states.ru = `${states.hola}, ${states.hola}, ${states.hola}`));

      expect(getter(state, get, 'ru')).toBe('hello, hello, hello');
    }
  );
});

const createMapWithComputed = <T>(initialState: T): ObservableMap<T> & { computed: any } => {
  const map = createObservableMap(initialState);

  return {
    ...map,
    computed: computedSubscription(map),
  };
};
