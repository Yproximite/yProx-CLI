import { LocatorListItem } from './LocatorListItem';

export const LocatorList = {
  name: 'locator-list',
  template: '#yprox-store-locator-list-template',
  components: {
    LocatorListItem,
  },
  props: {
    locations: {
      type: Array,
      required: true,
    },
    fields: {
      type: Object,
      required: false,
    },
  },
};
