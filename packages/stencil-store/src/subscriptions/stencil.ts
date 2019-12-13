// @ts-ignore
import { forceUpdate, getRenderingElement } from '@stencil/core';

import { ObservableMap } from '../types';
import { appendToMap } from '../utils';

export const stencilSubscription = <T>({ subscribe }: Pick<ObservableMap<T>, 'subscribe'>) => {
  const elmsToUpdate = new Map<string, any[]>();

  if (typeof getRenderingElement !== 'function') {
    // If we are not in a stencil project, we do nothing.
    // This function is not really exported by @stencil/core.
    return;
  }

  subscribe({
    get(propName) {
      const elm = getRenderingElement();
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
};
