import { Component, h, Host, Method } from '@stencil/core';
import { state } from '../../utils/greeting-store';

@Component({
  tag: 'simple-store',
  shadow: false,
})
export class SimpleStore {

  @Method()
  async next() {
    state.clicks++;
  }

  render() {
    return (
      <Host>
        {state.hello}
        <span>{state.clicks}</span>
        <span>{state.squaredClicks}</span>
      </Host>
    );
  }
}
