export const appendToMap = <K, V>(map: Map<K, V[]>, propName: K, value: V) => {
  const items = map.get(propName);
  if (!items) {
    map.set(propName, [value]);
  } else if (!items.includes(value)) {
    items.push(value);
  }
};
