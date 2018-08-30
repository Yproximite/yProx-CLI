import Promise from 'core-js-pure/features/promise';
import Vue from 'vue';
import * as _ from 'lodash';
import algoliasearch from 'algoliasearch/dist/algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper/dist/algoliasearch.helper';

import { LocatorFilter } from './LocatorFilter';
import { LocatorList } from './LocatorList';
import { LocatorMap } from './LocatorMap';
import { LocatorPagination } from './LocatorPagination';
import { MapService, LocatorUtils, LocatorThermor } from '../service';

export const YproxStoreLocator = {
  name: 'yprox-store-locator',
  template: '#yprox-store-locator-template',
  components: {
    LocatorFilter,
    LocatorList,
    LocatorMap,
    LocatorPagination,
  },
  props: {
    algoliaApplicationId: {
      type: String,
      required: true,
    },
    algoliaApiKey: {
      type: String,
      required: true,
    },
    storeLocatorId: {
      type: Number,
      required: true,
    },
    indexName: {
      type: String,
      required: true,
    },
    resultsPerPage: {
      type: Number,
      required: true,
    },
    resultsPerPageOnSearch: {
      type: Number,
    },
    properties: {
      type: Array,
      required: true,
    },
    mapCenterLat: {
      type: Number,
      required: true,
    },
    mapCenterLng: {
      type: Number,
      required: true,
    },
    mapDisplayAllMarkers: {
      type: Boolean,
      required: true,
    },
    mapDefaultZoom: {
      type: Number,
      required: true,
    },
    zoomAfterPlaceSelect: {
      type: Number,
      required: true,
    },
    zoomAfterLocationSelect: {
      type: Number,
      required: true,
    },
    mapStyles: {
      type: Array,
      default: [],
    },
    calculateDistance: {
      type: Boolean,
      required: true,
    },
    sortLocationsBy: {
      type: String,
      required: false,
    },
    markerDataIcon: {
      validator: val => val === null || typeof val === 'string',
    },
    enableClusterer: {
      type: Boolean,
      required: true,
    },
    fields: {
      type: Object,
      required: false,
    },
    iconLocation: {
      type: String,
      required: false,
    },
    displayOnlyStoresInInterventionArea: {
      type: Boolean,
      default: false,
    },
    displaySearchMarker: {
      type: Boolean,
      default: false,
    },
    googleAutocompleteType: {
      type: String,
      default: 'autocomplete',
    },
  },
  computed: {
    sortedLocations() {
      switch (this.sortLocationsBy) {
      case 'distance':
        return this.getSortedLocationsByDistance();
      default:
        return this.locations;
      }
    },
    filtered() {
      return _.filter(this.filter).length > 0 || this.place;
    },
  },
  data() {
    return {
      loaded: false,
      filter: {
        query: '',
      },
      sorters: [],
      place: null,
      count: 0,
      page: 0,
      pagesCount: 0,
      locations: [],
      savedLocations: [],
      propertyValues: {},
    };
  },
  methods: {
    initClient() {
      this.client = algoliasearch(this.algoliaApplicationId, this.algoliaApiKey);
    },
    initHelper() {
      const [hierarchicals, notHierarchicals] = _.partition(this.properties, { type: 'hierarchical' });
      const [disjunctiveProps, props] = _.partition(notHierarchicals, { disjunctive: true });

      const hierarchicalFacets = hierarchicals.map(
        property => ({
          name: property.name,
          attributes: _.range(property.maxDepthLevel).map(depthLevel => `${property.name}.lvl${depthLevel}`),
        }),
      );

      const helperParams = {
        getRankingInfo: 1,
        hitsPerPage: this.resultsPerPage,
        facets: props.map(property => property.name),
        disjunctiveFacets: disjunctiveProps.map(property => property.name),
        hierarchicalFacets,
      };

      this.helper = algoliasearchHelper(this.client, this.indexName, helperParams);
      this.helper.on('result', this.onHelperResult.bind(this));
    },
    initMapService() {
      const config = {
        map: {
          centerLat: this.mapCenterLat,
          centerLng: this.mapCenterLng,
          displayAllMarkers: this.mapDisplayAllMarkers,
          defaultZoom: this.mapDefaultZoom,
          zoomAfterPlaceSelect: this.zoomAfterPlaceSelect,
          zoomAfterLocationSelect: this.zoomAfterLocationSelect,
        },
        marker: {
          defaultIcon: this.markerDataIcon,
          enableClusterer: this.enableClusterer,
          displaySearchMarker: this.displaySearchMarker,
          actionsOnMouseOver: this.$root.actionsOnMouseOver,
        },
        autocomplete: {
          type: this.googleAutocompleteType,
        },
      };

      this.$root.mapService = new MapService(config);
      this.$root.iconLocation = this.iconLocation;
    },
    updateDistances(locations) {
      if (!this.place) {
        this.unsetDistances();

        return;
      }

      if (!locations.length) {
        return;
      }

      const location = locations.shift();

      this.$root.mapService
        .getDistance(this.place, location)
        .catch(() => Promise.resolve(-1))
        .then((distance) => {
          Vue.set(location, 'distance', distance);

          setTimeout(() => {
            this.updateDistances(locations);
          }, 500);
        });
    },
    unsetDistances() {
      this.locations.forEach((location) => {
        location.distance = null;
      });
    },
    onHelperResult(result) {
      this.loaded = true;
      this.locations = LocatorUtils.getLocationsFromResult(result);
      this.count = result.nbHits;
      this.page = result.page;
      this.pagesCount = result.nbPages;

      if (this.savedLocations.length === 0) {
        this.savedLocations = _.sortBy(this.locations, 'title');
      }

      this.properties.forEach((property) => {
        const options = {
          sortBy: [
            'isRefined:desc',
            'count:desc',
          ],
        };

        const values = property.type === 'hierarchical'
          ? _.find(result.hierarchicalFacets, { name: property.name })
          : result.getFacetValues(property.name, options);
        Vue.set(this.propertyValues, property.name, values);
      });

      if (this.calculateDistance) {
        this.updateDistances([...this.locations]);
      }
    },
    updateRefinements() {
      this.helper.clearRefinements();
      this.helper.addNumericRefinement('store_locator_id', '=', this.storeLocatorId);
      this.helper.setQuery(this.filter.query);
      if (this.$root.selected !== null) {
        this.helper.setQuery(this.$root.selected.title);
      }

      const resultsPerPage = this.resultsPerPageOnSearch && this.filtered
        ? this.resultsPerPageOnSearch
        : this.resultsPerPage;
      this.helper.setQueryParameter('hitsPerPage', resultsPerPage);

      if (this.place) {
        if (this.displayOnlyStoresInInterventionArea) {
          this.applyInterventionAreaFilter();
        }

        if (this.sortLocationsBy === 'distance') {
          this.helper.setQueryParameter('aroundLatLng', `${this.place.lat}, ${this.place.lng}`);
        }
      }

      this.properties.forEach((property) => {
        switch (property.type) {
        case 'list':
        case 'select':
          this.applyListFilter(property);
          break;
        case 'boolean':
          this.applyBooleanFilter(property);
          break;
        case 'hierarchical':
          this.applyHierarchicalFilter(property);
          break;
        case 'sort':
          this.applySorter(property);
          break;
        case 'selectPartners':
        case 'location':
        case 'query':
          break;
        default:
          throw new Error(`Undefined property type ${property.type}.`);
        }
      });
    },
    applyListFilter(property) {
      const value = this.filter[property.name];

      if (Array.isArray(value)) {
        value.forEach((item) => {
          this.addRefinement(property, item);
        });
      }
    },
    applyBooleanFilter(property) {
      const value = this.filter[property.name];

      if (value) {
        property.trueValues.forEach((trueValue) => {
          this.addRefinement(property, trueValue);
        });
      }
    },
    applyHierarchicalFilter(property) {
      const value = this.filter[property.name];

      if (value) {
        this.helper.addHierarchicalFacetRefinement(property.name, value);
      }
    },
    applySorter(property) {
      const fieldToken = property.name.replace(/^attributes\./, '');
      const directionValue = (property.trueValues[0] || '').toLowerCase();
      const direction = (!directionValue || directionValue === 'asc') ? 'asc' : 'desc';

      this.addSorter({
        fieldToken,
        direction,
      });
    },
    applyInterventionAreaFilter() {
      const { lat, lng } = this.place;

      this.helper.addNumericRefinement('area_intervention.top_left.lat', '<=', lat);
      this.helper.addNumericRefinement('area_intervention.top_left.lng', '<=', lng);
      this.helper.addNumericRefinement('area_intervention.bottom_right.lat', '>=', lat);
      this.helper.addNumericRefinement('area_intervention.bottom_right.lng', '>=', lng);
    },
    addRefinement(property, value) {
      if (property.disjunctive) {
        this.helper.addDisjunctiveFacetRefinement(property.name, value);
      } else {
        this.helper.addFacetRefinement(property.name, value);
      }
    },
    addSorter(sorter) {
      this.sorters.push(sorter);
    },
    clearSorters() {
      this.sorters = [];
    },
    search() {
      if (this.isReadyToSearch()) {
        this.updateRefinements();
      }

      this.helper.search();
    },
    isReadyToSearch() {
      let hasMandatoryProperty = false;
      let hasMandatoryMissing = false;

      this.properties.forEach((property) => {
        const value = this.filter[property.name];

        if (property.mandatory) {
          hasMandatoryProperty = true;

          if (!value || (Array.isArray(value) && value.length === 0)) {
            hasMandatoryMissing = true;
          }
        }
      });

      return (!hasMandatoryProperty || (this.place && hasMandatoryMissing === false));
    },
    onLocationSelect(location) {
      this.$root.mapService.selectLocation(location);
    },
    selectPage(page) {
      this.helper.setPage(page - 1);

      this.search();
    },
    getSortedLocationsByDistance() {
      const [calculated, notCalculated] = _.partition(
        this.locations,
        location => location.distance !== null && location.distance !== -1,
      );

      const locations = _.sortBy(calculated, 'distance').concat(notCalculated);

      return this.sort(locations);
    },
    sort(locations) {
      let { iteratees, directions } = this.doSort(locations);

      // Specific Thermor
      if (this.storeLocatorId === 75) {
        if ((this.filter['attributes.store_projets'] || [])[0] === 'Radiateurs et sèche-serviettes') {
          return LocatorThermor.orderElements(locations, iteratees, directions);
        }

        const payload = this.doSort(locations, (({ fieldToken }) => fieldToken !== 'service--garantie'));
        // eslint-disable-next-line prefer-destructuring
        iteratees = payload.iteratees;
        // eslint-disable-next-line prefer-destructuring
        directions = payload.directions;
      }

      return _.orderBy(locations, iteratees, directions);
    },
    doSort(locations, callback = () => true) {
      const iteratees = [];
      const directions = [];

      (this.sorters || []).forEach(({ fieldToken, direction }) => {
        if (!callback({ fieldToken, direction })) {
          return;
        }

        iteratees.push(location => !this.normalizeData(this.fields[location.siteId][fieldToken] || null));
        directions.push(direction);
      });

      return { iteratees, directions };
    },
    normalizeData(data) {
      return !(data === null || data === '' || data.toLowerCase() === 'non');
    },
  },
  watch: {
    filter: {
      deep: true,
      handler() {
        this.search();
      },
    },
    place() {
      this.search();
    },
    '$root.selected': {
      deep: true,
      handler() {
        this.search();
      },
    },
    displayOnlyStoresInInterventionArea() {
      this.search();
    },
  },
  created() {
    this.initClient();
    this.initHelper();
    this.initMapService();
    this.search();
  },
};
