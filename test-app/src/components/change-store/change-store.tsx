import { Component, Prop, Host, h } from '@stencil/core';
import { state } from '../../utils/greeting-store';

@Component({
  tag: 'change-store',
  shadow: false,
})
export class ChangeStore {
  @Prop() storeKey: 'hola' | 'adios';
  @Prop() storeValue: string;

  changeValue() {
    state[this.storeKey] = this.storeValue;
  }

  render() {
    return (
      <Host>
        <button onClick={() => this.changeValue()}>Change!</button>
      </Host>
    );
  }
}
