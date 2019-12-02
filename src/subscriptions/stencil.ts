// @ts-ignore
import { forceUpdate, getRenderingElement } from '@stencil/core';

import { CreateStoreReturn } from '../types';
import { appendToMap } from '../utils';

export const stencilSubscription = <T>({ subscribe }: Pick<CreateStoreReturn<T>, 'subscribe'>) => {
  const elmsToUpdate = new Map<string, any[]>();

  subscribe({
    get(_state, propName) {
      const elm = typeof getRenderingElement === 'function' && getRenderingElement();
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
