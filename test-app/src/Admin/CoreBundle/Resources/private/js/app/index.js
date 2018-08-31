/* eslint-disable import/first */
import { polyfill as promisePolyfill } from 'es6-promise';

promisePolyfill();

import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import components from './components';
import directives from './directives';
import filters from './filters';
import mixins from './mixins';
import utils from './utils';

global.App = {
  ...components,
  ...directives,
  ...mixins,
  ...filters,
  ...utils,
};

global.YproxComponentsBootstrap = function YproxComponentsBootstrap(Vue) {
  if (process.env.NODE_ENV === 'production') {
    Raven
      .config('https://48a8870ba8994aa09d630959f4ba0062@sentry.io/128101')
      .addPlugin(RavenVue, Vue)
      .install();
  }

  const {
    apiInterface, provideComponents, provideDirectives, provideFilters,
  } = global.App;

  Vue.use(apiInterface);
  Vue.use(provideComponents);
  Vue.use(provideDirectives);
  Vue.use(provideFilters);
};
