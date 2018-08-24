export default function install(Vue) {
  Vue.filter(
    'truncate',
    (text, length, clamp = '...') => (
      text.length > length
        ? text.slice(0, length) + clamp
        : text
    ),
  );
}
