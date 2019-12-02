import { ComputedReturn, CreateStoreReturn } from '../types';
import { appendToMap } from '../utils';

export const computedSubscription = <T>({
  get,
  set,
}: Pick<CreateStoreReturn<T>, 'get' | 'set'>): ComputedReturn<T> => {
  const computedStates = new Map<string, (() => void)[]>();

  return {
    subscription: {
      reset() {
        computedStates.forEach(computeds => computeds.forEach(h => h()));
      },
      set(_state, propName) {
        const computed = computedStates.get(propName as string);
        if (computed) {
          computed.forEach(h => h());
        }
      },
    },
    computed: (gen: (states: T) => void): void => {
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
    },
  };
};
