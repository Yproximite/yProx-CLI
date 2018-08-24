import Vue from 'vue';

export const LocatorFilterList = {
  name: 'locator-filter-list',
  template: '#yprox-store-locator-filter-list-template',
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
    values: {
      get() {
        return this.filter[this.property.name] || [];
      },
      set(values) {
        Vue.set(this.filter, this.property.name, values);
      },
    },
  },
  methods: {
    toggleItem(item) {
      const values = [...this.values];
      const itemIndex = values.indexOf(item);

      if (itemIndex !== -1) {
        values.splice(itemIndex, 1);
      } else {
        values.push(item);
      }

      this.values = values;
    },
    isItemSelected(item) {
      return this.values.indexOf(item) !== -1;
    },
  },
};
