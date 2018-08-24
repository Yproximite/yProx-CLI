import Vue from 'vue';
import * as _ from 'lodash';

const separator = ' > ';

export const LocatorFilterHierarchical = {
  name: 'locator-filter-hierarchical',
  template: '#yprox-store-locator-filter-hierarchical-template',
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
    levels() {
      const topLevel = this.propertyValues[this.property.name];

      return topLevel ? this.getLevelAndActiveChild(topLevel) : [];
    },
    value: {
      get() {
        return this.filter[this.property.name] || '';
      },
      set(value) {
        Vue.set(this.filter, this.property.name, value || null);
      },
    },
  },
  methods: {
    getLevelAndActiveChild(level) {
      const children = this.getActiveChildLevels(level);

      return [level, ...children];
    },
    getActiveChildLevels(parent) {
      const activeLevel = _.find(parent.data, child => child.data);

      return activeLevel ? this.getLevelAndActiveChild(activeLevel) : [];
    },
    isValueSelected(value) {
      return value.length < this.value.length
        ? this.value.indexOf(`${value}${separator}`) !== -1
        : value === this.value;
    },
    setValue(path, value) {
      this.value = value || path;
    },
  },
};
