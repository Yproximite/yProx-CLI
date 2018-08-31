export default function install(Vue) {
  Vue.filter('alphaDash', {
    read(val) {
      return `${val}`;
    },
    write(val) {
      return val.replace(/[^a-z0-9_-]/ig, '');
    },
  });
}
