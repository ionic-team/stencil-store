// @ts-ignore
import { forceUpdate, getRenderingElement } from '@stencil/core';

// TODO
// reset()
export const createStore = <T extends { [key: string]: any }>(defaultState?: T) => {
  const states = new Map<string, any>(Object.entries(defaultState ?? {}));
  const elmsToUpdate = new Map<string, any[]>();
  const computedStates = new Map<string, (() => void)[]>();

  const appendToMap = (map: Map<string, any[]>, propName: string, value: any) => {
    const items = map.get(propName);
    if (!items) {
      map.set(propName, [value]);
    } else if (!items.includes(value)) {
      items.push(value);
    }
  }

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    const elm = getRenderingElement();
    if (elm) {
      appendToMap(elmsToUpdate, propName, elm);
    }
    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    if (states.get(propName) !== value) {
      states.set(propName, value);
      const elements = elmsToUpdate.get(propName);
      if (elements) {
        elmsToUpdate.set(propName, elements.filter(forceUpdate))
      }
      const computed = computedStates.get(propName);
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

  const computed = (gen: (states: T) => void) => {
    const states = new Proxy({}, {
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
    computed,
    get,
    set,
  };
};
