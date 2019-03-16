/**
 * Should be used in Array#reduce().
 */
export function groupBy(key: string): (acc: { [k: string]: any }, item: any) => { [k: string]: any } {
  return (acc, item) => {
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
export function flatten(): (acc: any[], values: any | any[]) => any[] {
  return (acc, values) => {
    return acc.concat(values);
  };
}

export function ensureArray<T>(arg: T[]): T[] {
  return Array.isArray(arg) ? arg : [arg];
}
