# @stencil/store

Store is a simple global state library from StencilJS.

Allows to share a global state across components that triggers re-render when necesary.


## Example

**store.ts:**
```ts
import { createStore } from "@stencil/store";

const { state } = createStore({
  'clicks': 0,
  'seconds': 0,
  'suma': 0
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
  render() {
    return (
      <div>
        <p>
          <MyGlobalCounter></MyGlobalCounter>
          <p>
            {store.seconds}
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
