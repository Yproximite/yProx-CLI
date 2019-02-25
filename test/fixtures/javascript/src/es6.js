const constant = 'abc';
console.log(`The constant value: ${constant}`);

let arr = [1, 2, 3];
arr = [...arr];

let obj = { a: '1', b: '2', c: '3' };
obj = { ...obj };

const myFunction = (arg1, arg2, ...otherArgs) => {
  console.log({
    arg1,
    arg2,
    otherArgs,
  });
};
