import { forceUpdate, getRenderingRef } from '@stencil/core';
import { ObservableMap } from '../types';
import { appendToMap, debounce } from '../utils';

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement: any) =>
  !('isConnected' in maybeElement) || maybeElement.isConnected;

const cleanupElements = debounce(async (map: Map<string, any[]>) => {
  const keys = Array.from(map.keys());

  for (let key of keys) {
    map.set(key, map.get(key).filter(isConnected));
  }
}, 2_000);

export const stencilSubscription = <T>({ subscribe }: Pick<ObservableMap<T>, 'subscribe'>) => {
  const elmsToUpdate = new Map<string, any[]>();

  if (typeof getRenderingRef !== 'function') {
    // If we are not in a stencil project, we do nothing.
    // This function is not really exported by @stencil/core.
    return;
  }

  subscribe({
    get(propName) {
      const elm = getRenderingRef();
      if (elm) {
        appendToMap(elmsToUpdate, propName as string, elm);
      }
    },
    reset() {
      elmsToUpdate.forEach(elms => elms.forEach(forceUpdate));
    },
    set(propName) {
      const elements = elmsToUpdate.get(propName as string);
      if (elements) {
        elmsToUpdate.set(propName as string, elements.filter(forceUpdate));
      }
    },
  });
  subscribe(() => cleanupElements(elmsToUpdate));
};
