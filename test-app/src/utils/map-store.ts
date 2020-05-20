import { createStore } from '@stencil/store';

export interface Item {
  id: string;
  name: string;
  created: Date;
}

const store = createStore<Record<string, Item>>({});

export const dispose = store.dispose;
export const state = store.state;
export const reset = store.reset;
