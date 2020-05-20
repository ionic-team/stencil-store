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

export const stencilSubscription = <T>({ on }: ObservableMap<T>) => {
  const elmsToUpdate = new Map<string, any[]>();
  const elmsToSubscriptions = new Map<any, string[]>();
  const cleanupMap = new Map<any, () => void>();

  const reverseCleanup = (elm, propName) => {
    if (cleanupMap.has(elm)) {
      cleanupMap.get(elm)();
    } else {
      const previous = elmsToSubscriptions.get(elm) || [];
      
      elmsToSubscriptions.delete(elm);

      const clean = debounce(() => {
        const current = elmsToSubscriptions.get(elm);
        
        for (const key of previous) {
          if (current.includes(key)) continue;

          const elements = elmsToUpdate.get(key).filter((el) => el !== elm);
          
          if (elements.length) {
            elmsToUpdate.set(key, elements);
          } else {
            elmsToUpdate.delete(key);
          }

          console.log(elmsToUpdate);
        }

        cleanupMap.delete(elm);
      }, 0);

      cleanupMap.set(elm, clean);
    }

    appendToMap(elmsToSubscriptions, elm, propName as string);
  };


  if (typeof getRenderingRef === 'function') {
    // If we are not in a stencil project, we do nothing.
    // This function is not really exported by @stencil/core.

    on('dispose', () => {
      elmsToUpdate.clear();
    });

    on('get', (propName) => {
      const elm = getRenderingRef();
      if (elm) {
        appendToMap(elmsToUpdate, propName as string, elm);
        reverseCleanup(elm, propName);
      }

    });

    on('set', (propName) => {
      const elements = elmsToUpdate.get(propName as string);
      if (elements) {
        elmsToUpdate.set(propName as string, elements.filter(forceUpdate));
      }
      cleanupElements(elmsToUpdate);
    });

    on('delete', (propName) => {
      const elements = elmsToUpdate.get(propName as string);
      if (elements) {
        elmsToUpdate.set(propName as string, elements.filter(forceUpdate));
      }
      cleanupElements(elmsToUpdate);
    })

    on('reset', () => {
      elmsToUpdate.forEach((elms) => elms.forEach(forceUpdate));
      cleanupElements(elmsToUpdate);
    });
  }
};
