import { Component, Host, h } from '@stencil/core';
import { state, Item } from '../../utils/map-store';

@Component({
  tag: 'display-map-store',
  shadow: false,
})
export class DisplayMapStore {
  private currentId: number = 0;

  render() {
    return (
      <Host>
        <div>
          <button onClick={this.addToMap}>add</button>
          <button onClick={this.deleteFromMap}>remove</button>
        </div>

        <div>
          {/* Always try to display the first 10 items (adds subscription for all) */}
          {Array.from({ length: 10 }, (_, i) => {
            const item = state[`id-${i}`];

            if (!item) return null;

            return (
              <div
                style={{
                  border: '1px solid grey',
                  padding: '5px',
                  margin: '5px',
                }}
              >
                <div>{item.name}</div>
                <div>{item.created.toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      </Host>
    );
  }

  private addToMap = () => {
    const item: Item = {
      id: `id-${this.currentId}`,
      name: `item-${this.currentId}`,
      created: new Date(),
    };

    state[item.id] = item;

    this.currentId++;
  };

  private deleteFromMap = () => {
    this.currentId--;
    delete state[`id-${this.currentId}`];
  };
}
