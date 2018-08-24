import Translator from 'translator';

export default function install(Vue) {
  Vue.filter('transChoice', (...args) => Translator.trans(...args));
}
