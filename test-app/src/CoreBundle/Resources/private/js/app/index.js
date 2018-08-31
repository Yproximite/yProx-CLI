/**
 * Front application bootstrap:
 *
 * - global vuejs components/directives/mixins/filters
 * - raven
 */

import 'core-js/features/array/reduce';
import 'core-js/features/object/assign';
import 'core-js/features/promise';
import 'core-js/features/promise/finally';

import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import * as components from './components';
import * as directives from './directives';
import * as filters from './filters';
import * as mixins from './mixins';

// global definition of components, directives and filters
Object.values(components).forEach((component) => {
  Vue.component(component.name, component);
});

Object.values(directives).forEach((directiveProvider) => {
  directiveProvider(Vue);
});

Object.values(filters).forEach((filterProvider) => {
  filterProvider(Vue);
});

// provide all functionality via browserify-shim (see package.json)
global.AppFront = {
  ...components,
  ...directives,
  ...mixins,
  ...filters,
};

if (process.env.NODE_ENV === 'production') {
  Raven
    .config('https://48a8870ba8994aa09d630959f4ba0062@sentry.io/128101')
    .addPlugin(RavenVue, Vue)
    .install();
}
