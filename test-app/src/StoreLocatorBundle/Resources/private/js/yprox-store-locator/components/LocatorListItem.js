export const LocatorListItem = {
  name: 'locator-list-item',
  template: '#yprox-store-locator-list-item-template',
  props: {
    location: {
      type: Object,
      required: true,
    },
    fields: {
      type: Object,
      required: false,
    },
  },
  mounted() {
    // eslint-disable-next-line no-underscore-dangle
    if (typeof global.__storeLocatorOnItemCallback === 'function') {
      // eslint-disable-next-line no-underscore-dangle
      global.__storeLocatorOnItemCallback(this.$el);
    }
  },
};
