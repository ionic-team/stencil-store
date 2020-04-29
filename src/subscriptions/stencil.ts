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

const cleanupElements = debounce((map: Map<string, any[]>) => {
  for (let key of map.keys()) {
    map.set(key, map.get(key).filter(isConnected));
  }
}, 2_000);

/**
 * Same as forceUpdate from @stencil/core but catches
 * any errors thrown and return false.
 *
 * This was added because in tests calling reset to the
 * same store in different test cases was raising an error
 * from forceUpdate.
 *
 * This feels like a workaround though.
 */
const safeForceUpdate = (ref) => {
  try {
    return forceUpdate(ref);
  } catch {
    return false;
  }
};

export const stencilSubscription = <T>({ on }: ObservableMap<T>) => {
  const elmsToUpdate = new Map<string, any[]>();

  if (typeof getRenderingRef === 'function') {
    // If we are not in a stencil project, we do nothing.
    // This function is not really exported by @stencil/core.

    on('get', (propName) => {
      const elm = getRenderingRef();
      if (elm) {
        appendToMap(elmsToUpdate, propName as string, elm);
      }
    });

    on('set', (propName) => {
      const elements = elmsToUpdate.get(propName as string);
      if (elements) {
        elmsToUpdate.set(propName as string, elements.filter(safeForceUpdate));
      }
      cleanupElements(elmsToUpdate);
    });

    on('reset', () => {
      elmsToUpdate.forEach((elms) => elms.forEach(safeForceUpdate));
      cleanupElements(elmsToUpdate);
    });
  }
};
