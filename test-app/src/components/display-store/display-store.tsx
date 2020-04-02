import { Component, Prop, h, Host } from '@stencil/core';
import { state } from '../../utils/greeting-store';

@Component({
  tag: 'display-store',
  shadow: false,
})
export class DisplayStore {
  @Prop() storeKey: 'hello' | 'goodbye';

  i = 0;

  render() {
    this.i++;
    return (
      <Host>
        <span class="counter">{this.i}</span>
        <span class="value">{state[this.storeKey]}</span>
      </Host>
    );
  }
}
