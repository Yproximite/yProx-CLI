import queryString from 'query-string';
import { MapService } from '../service';

export const LocatorLocationInput = {
  name: 'locator-location-input',
  template: '#yprox-store-locator-location-input-template',
  props: {
    value: {
      type: Object,
    },
  },
  computed: {
    displayValue() {
      return this.value ? this.value.name : null;
    },
  },
  methods: {
    onReady() {
      this.$root.mapService.initGoogleAutocomplete(this.$refs.input);

      this.$root.mapService.addEventListener(
        MapService.POSITION_CHANGED,
        this.onPositionChanged.bind(this),
      );
    },
    onPositionChanged(position) {
      this.$root.mapService.addMarkerLocation(position, this.$root.iconLocation);
      this.$emit('input', position);
    },
    doDeletePosition() {
      this.$root.mapService.deleteMarkerLocation();
      this.$emit('input', null);
    },
  },
  mounted() {
    this.$nextTick(this.onReady.bind(this));
    const urlParameters = queryString.parse(global.location.search);

    if (urlParameters.place) {
      const value = urlParameters.place;

      this.$root.mapService.geocode(value, 'FR');
    }
  },
};
