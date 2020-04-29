import { stencilSubscription } from './subscriptions/stencil';
import { createObservableMap } from './observable-map';
import { ObservableMap } from './types';

export const createStore = <T extends { [key: string]: any }>(
  defaultState?: T,
  shouldUpdate?: (newV: any, oldValue, prop: keyof T) => boolean
): ObservableMap<T> => {
  const map = createObservableMap(defaultState, shouldUpdate);
  stencilSubscription(map);
  return map;
};
