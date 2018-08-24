export const LocatorMap = {
  name: 'locator-map',
  template: '#yprox-store-locator-map-template',
  props: {
    locations: {
      type: Array,
      required: true,
    },
    styles: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    onReady() {
      this.$root.mapService.initMap(this.$refs.map, this.styles);
      this.$root.mapService.setLocations(this.locations);
    },
  },
  watch: {
    locations(locations) {
      this.$root.mapService.setLocations(locations);
    },
  },
  mounted() {
    this.$nextTick(this.onReady.bind(this));
  },
  beforeDestroy() {
    this.$root.mapService.destroyMap();
  },
};
