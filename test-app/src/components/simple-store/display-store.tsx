import { Component, h, Host, Method } from '@stencil/core';
import { state } from '../../utils/greeting-store';

@Component({
  tag: 'simple-store',
  shadow: false,
})
export class SimpleStore {

  private count = 0;

  @Method()
  async next() {
    state.hello = `${this.count++}`;
  }

  render() {
    return (
      <Host>
        {state.hello}
      </Host>
    );
  }
}
