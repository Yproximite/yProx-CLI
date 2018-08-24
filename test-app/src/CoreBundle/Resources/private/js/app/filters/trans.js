import Translator from 'translator';

export default function install(Vue) {
  Vue.filter('trans', (...args) => Translator.trans(...args));
}
