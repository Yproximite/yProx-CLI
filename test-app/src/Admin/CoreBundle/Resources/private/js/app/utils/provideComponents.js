import _ from 'underscore';
import { tooltip, datepicker } from 'vue-strap';
import components from '../components';

export default function install(Vue) {
  const appComponents = _.indexBy(components, 'name');
  const allComponents = {
    ...appComponents,
    tooltip,
    datepicker,
  };

  _.each(allComponents, (component, name) => {
    Vue.component(name, component);
  });
}
