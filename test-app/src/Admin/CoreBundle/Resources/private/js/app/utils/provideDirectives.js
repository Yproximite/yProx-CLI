import _ from 'underscore';
import directives from '../directives';

export default function install(Vue) {
  _.each(directives, (directiveProvider) => {
    directiveProvider(Vue);
  });
}
