export const appendToMap = <K, V>(map: Map<K, V[]>, propName: K, value: V) => {
  const items = map.get(propName);
  if (!items) {
    map.set(propName, [value]);
  } else if (!items.includes(value)) {
    items.push(value);
  }
};

export const debounce = <T extends (...args: any) => any>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(null, args);
    }, ms);
  };
};

export const forMs = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));