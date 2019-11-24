# @stencil/store

Store is a simple global state library from StencilJS.

Allows to share a global state across components that triggers re-render when necesary.


## Example

**store.ts:**
```ts
import { createStore } from "@stencil/store";

const { state, subscribe } = createStore({
  'clicks': 0,
  'seconds': 0,
  'sum': 0,
  'squaredClicks': 0
});

// Can be used to memoize state
// Subscribe is only executed when 'seconds' and 'click' changes!
subscribe(state => {
  state.sum = state.seconds + state.clicks;
  state.squaredClicks = state.seconds ** 2;
});

export default state;
```

**component.tsx:**
```tsx
import { Component, h } from '@stencil/core';
import store from '../store';

@Component({
  tag: 'app-profile',
})
export class AppProfile {

  componentWillLoad() {
    setInterval(() => store.seconds++, 1000);
  }

  render() {
    return (
      <div>
        <p>
          <MyGlobalCounter></MyGlobalCounter>
          <p>
            {store.sum}
          </p>
        </p>
      </div>
    );
  }
}

const MyGlobalCounter = () => {
  return (
    <button onClick={() => store.clicks++}>
      {store.clicks}
    </button>
  );
};
