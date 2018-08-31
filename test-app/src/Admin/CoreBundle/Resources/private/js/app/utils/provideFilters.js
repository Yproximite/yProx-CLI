import _ from 'underscore';
import filters from '../filters';

export default function install(Vue) {
  _.each(filters, (filterProvider) => {
    filterProvider(Vue);
  });
}
