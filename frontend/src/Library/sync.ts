export function combineMessages(
  store1: Record<string, Record<string, any>>,
  store2: Record<string, Record<string, any>>
): Record<string, Record<string, any>> {
  let combinedStore: Record<string, Record<string, any>> = {};

  // Combine the keys from both stores
  let allKeys = new Set<string>([
    ...Object.keys(store1),
    ...Object.keys(store2),
  ]);

  // Iterate over each key and merge objects
  allKeys.forEach((key) => {
    combinedStore[key] = {
      ...(store1[key] || {}), // Spread operator handles undefined case
      ...(store2[key] || {}),
    };
  });

  return combinedStore;
}

export function removeMessages(
  store: Record<string, Record<string, any>>,
  keysToRemove: Record<string, string[]>
): Record<string, Record<string, any>> {
  // Create a deep copy of the store to avoid mutating the original object
  let modifiedStore = JSON.parse(JSON.stringify(store));

  // Iterate over each key in the keysToRemove record
  for (const [storeKey, removeKeys] of Object.entries(keysToRemove)) {
    if (modifiedStore[storeKey]) {
      // Remove each key listed in the removeKeys array from the store
      removeKeys.forEach((key) => {
        delete modifiedStore[storeKey][key];
      });
    }
  }

  return modifiedStore;
}
