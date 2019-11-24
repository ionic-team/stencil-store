// @ts-ignore
import { forceUpdate, getRenderingElement } from '@stencil/core';

// TODO
// reset()
export const createStore = <T extends {[key: string]: any}>(defaultState?: T) => {
  const states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const elmsToUpdate = new Map<string, any[]>();
  const computedStates = new Map<string, (() => void)[]>();

  const appendToMap = (map: Map<string, any[]>, state: string, value: any) => {
    const items = map.get(state);
    if (!items) {
      map.set(state, [value]);
    } else if (!items.includes(value)) {
      items.push(value);
    }
  }

  const get = <P extends keyof T>(state: P & string): T[P] => {
    const elm = getRenderingElement();
    if (elm) {
      appendToMap(elmsToUpdate, state, elm);
    }
    return states.get(state);
  };

  const set = <P extends keyof T>(state: P & string, value: T[P]) => {
    if (states.get(state) !== value) {
      states.set(state, value);
      const elements = elmsToUpdate.get(state);
      if (elements) {
        elmsToUpdate.set(state, elements.filter(forceUpdate))
      }
      const computed = computedStates.get(state);
      if (computed) {
        computed.forEach(h => h());
      }
    }
  }

  const state = new Proxy(defaultState, {
    get(_, propName) {
      return get(propName as any);
    },
    set(_, propName, value) {
      set(propName as any, value);
      return true;
    }
  });

  const subscribe = (gen: (states: T) => void) => {
    const states = new Proxy({} , {
      get(_, propName: any) {
        appendToMap(computedStates, propName, handler);
        return get(propName);
      },
      set(_, propName: any, value: any) {
        set(propName, value);
        return true;
      }
    });
    const handler = () => {
      gen(states as T);
    };
    handler();
  };

  return {
    state,
    get,
    set,
    subscribe
  };
};
