import Vue from 'vue';

export const LocatorFilterBoolean = {
  name: 'locator-filter-boolean',
  template: '#yprox-store-locator-filter-boolean-template',
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
    checked: {
      get() {
        return this.filter[this.property.name] || false;
      },
      set(checked) {
        Vue.set(this.filter, this.property.name, checked);
      },
    },
    count() {
      return this.propertyValues
        .filter(value => this.property.trueValues.indexOf(value.name) !== -1)
        .reduce((accumulator, value) => accumulator + value, 0);
    },
  },
};
