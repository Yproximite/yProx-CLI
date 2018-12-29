/**
 * Should be used in Array#reduce().
 */
export function groupBy(key: string): (acc: { [k: string]: any }, item: any) => { [k: string]: any } {
  return (acc: { [k: string]: any }, item: any) => {
    const value = item[key];

    if (!acc[value]) {
      acc[value] = [];
    }

    acc[value].push(item);

    return acc;
  };
}

/**
 * Should be used in Array#reduce().
 */
export function flatten() {
  return (acc: [], values: []) => {
    // @ts-ignore
    acc = acc.concat(values);
    return acc;
  };
}
