import { ComputedReturn, ObservableMap } from '../types';
import { appendToMap } from '../utils';

export const computedSubscription = <T>({
  get,
  set,
  subscribe,
}: Pick<ObservableMap<T>, 'get' | 'set' | 'subscribe'>): ComputedReturn<T> => {
  const computedStates = new Map<string, (() => void)[]>();

  subscribe({
    reset() {
      computedStates.forEach(computeds => computeds.forEach(h => h()));
    },
    set(_state, propName) {
      const computed = computedStates.get(propName as string);
      if (computed) {
        computed.forEach(h => h());
      }
    },
  });

  return (gen: (states: T) => void): void => {
    const states = new Proxy(
      {},
      {
        get(_, propName: any) {
          appendToMap(computedStates, propName, handler);
          return get(propName);
        },
        set(_, propName: any, value: any) {
          set(propName, value);
          return true;
        },
      }
    );
    let beingCalled = false;
    const handler = () => {
      if (beingCalled) {
        return;
      }
      beingCalled = true;
      gen(states as T);
      beingCalled = false;
    };
    handler();
  };
};
