import { createStore } from '@stencil/store';

const store = createStore({
  hello: 'hola',
  goodbye: 'adiós',
  clicks: 0,
  squaredClicks: 0
});

store.onChange('clicks', value => {
  state.squaredClicks = value ** 2;
});

export const state = store.state;
export const reset = store.reset;
