import { stencilSubscription } from './subscriptions/stencil';
import { createObservableMap } from './observable-map';
import { ObservableMap } from './types';

export const createStore = <T extends { [key: string]: any }>(
  defaultState?: T
): ObservableMap<T> => {
  const map = createObservableMap(defaultState);

  stencilSubscription(map);
  return map;
};
