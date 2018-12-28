/**
 * Should be used in Array#reduce().
 * @param {String} key
 * @return {Function}
 */
export function groupBy(key) {
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
 * @return {Function}
 */
export function flatten() {
  return (acc, values) => {
    acc = acc.concat(values);
    return acc;
  };
}
