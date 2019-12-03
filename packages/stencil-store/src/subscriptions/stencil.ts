// @ts-ignore
import { forceUpdate, getRenderingElement } from '@stencil/core';

import { CreateStoreReturn } from '../types';
import { appendToMap } from '../utils';

export const stencilSubscription = <T>({ subscribe }: Pick<CreateStoreReturn<T>, 'subscribe'>) => {
  const elmsToUpdate = new Map<string, any[]>();

  if (typeof getRenderingElement !== 'function') {
    // If we are not in a stencil project, we do nothing.
    // This function is not really exported by @stencil/core.
    return;
  }

  subscribe({
    get(_state, propName) {
      const elm = getRenderingElement();
      if (elm) {
        appendToMap(elmsToUpdate, propName as string, elm);
      }
    },
    reset() {
      elmsToUpdate.forEach(elms => elms.forEach(forceUpdate));
    },
    set(_state, propName) {
      const elements = elmsToUpdate.get(propName as string);
      if (elements) {
        elmsToUpdate.set(propName as string, elements.filter(forceUpdate));
      }
    },
  });
};
