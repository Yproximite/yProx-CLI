import Vue from 'vue';
import * as _ from 'lodash';
import queryString from 'query-string';

export const LocatorFilterSelect = {
  name: 'locator-filter-select',
  template: '#yprox-store-locator-filter-select-template',
  props: {
    property: {
      type: Object,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
    },
    propertyValues: {
      type: Object,
      required: true,
    },
  },
  computed: {
    value: {
      get() {
        const values = this.filter[this.property.name];

        return Array.isArray(values) ? values[0] : '';
      },
      set(value) {
        Vue.set(this.filter, this.property.name, value ? [value] : []);
      },
    },
  },
  mounted() {
    const urlParameters = queryString.parse(global.location.search);

    if (this.property.urlFilter && urlParameters[this.property.urlFilter]) {
      const values = this.propertyValues[this.property.name];
      const value = urlParameters[this.property.urlFilter];

      const result = _.find(values, { name: value });
      if (result !== undefined) {
        this.value = result.name;
      }
    }
  },
};
