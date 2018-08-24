import * as _ from 'lodash';

import { LocatorFilterList } from './LocatorFilterList';
import { LocatorFilterSelect } from './LocatorFilterSelect';
import { LocatorFilterBoolean } from './LocatorFilterBoolean';
import { LocatorLocationInput } from './LocatorLocationInput';
import { LocatorFilterHierarchical } from './LocatorFilterHierarchical';

export const LocatorFilter = {
  name: 'locator-filter',
  template: '#yprox-store-locator-filter-template',
  components: {
    LocatorFilterList,
    LocatorFilterSelect,
    LocatorFilterBoolean,
    LocatorLocationInput,
    LocatorFilterHierarchical,
  },
  props: {
    properties: {
      type: Array,
      required: true,
    },
    propertyValues: {
      type: Object,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
    },
    place: {
      type: Object,
    },
    locations: {
      type: Array,
      required: false,
    },
  },
  methods: {
    isVisible(propertyName) {
      const property = _.find(this.properties, { name: propertyName });
      const values = this.propertyValues[property.name]

      ;

      switch (property.type) {
      case 'list':
      case 'select':
      case 'boolean':
        return Array.isArray(values) && values.length;
      case 'hierarchical':
        return values && values.data;
      case 'location':
      case 'query':
      case 'selectPartners':
        return true;
      case 'sort':
        return false;
      default:
        throw new Error(`Undefined property type ${property.type}.`);
      }
    },
    selectMultiselectPartner() {
      this.$root.selected = this;
    },
    deleteMultiselectPartner() {
      this.$root.selected = null;
    },
    customMultiselectLabel(option) {
      return option.title;
    },
  },
};
