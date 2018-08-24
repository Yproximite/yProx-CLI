/* global $ */

import * as _ from 'lodash';
import google from 'google';
import MarkerClusterer from 'js-marker-clusterer';

import { MapUtils } from './MapUtils';
import { LocatorUtils } from './LocatorUtils';

/**
 * @param {Location} location
 */
const scrollToLocation = (location) => {
  const { siteId } = location;
  const selector = `[data-store-locator__site-id="${siteId}"]`;
  const $$store = $(selector);

  if ($$store.length === 1) {
    $('html, body').animate({
      scrollTop: $$store.offset().top - 48, // offset of 48px to having a better render result
    }, 500);
  }
};

/**
 * Greeting config
 * @typedef {Object} MapServiceObject
 * @property {google.maps.Marker} marker
 * @property {google.maps.InfoWindow} infoWindow
 * @property {Location} location
 */

export class MapService {
  /**
   * @param {Object} config
   * @param {Object} config.map
   * @param {number} config.map.centerLat
   * @param {number} config.map.centerLng
   * @param {Boolean} config.map.displayAllMarkers
   * @param {number} config.map.defaultZoom
   * @param {number} config.map.zoomAfterUpdate
   * @param {number} config.map.zoomAfterLocationSelect
   * @param {Object} config.marker
   * @param {number} config.marker.minVisibleZoom
   * @param {number} config.marker.enableClusterer
   * @param {Boolean} config.marker.displaySearchMarker
   * @param {?string} config.marker.defaultIcon
   * @param {Boolean} config.marker.actionsOnMouseOver
   */
  constructor(config) {
    this.config = config;
    this.directionService = new google.maps.DirectionsService();
    /** @type {MapServiceObject[]} */
    this.objects = [];
    this.directions = [];
    this.eventListeners = [];
  }

  /**
   * @param {Element} element
   * @param {Array}   styles
   */
  initMap(element, styles = []) {
    this.map = MapUtils.createMap(element, this.config.map, styles);

    if (this.config.marker.enableClusterer) {
      this.clusterer = new MarkerClusterer(this.map, [], { imagePath: '/plugins/markerclusterer/images/m' });
    }

    if (this.autocomplete) {
      this.autocomplete.bindTo('bounds', this.map);
    }
  }

  initGoogleAutocomplete(element) {
    if (this.config.autocomplete.type === 'searchbox') {
      this.initSearchBox(element);
    } else {
      this.initAutocomplete(element);
    }
  }

  /**
   * @param {Element} element
   */
  initAutocomplete(element) {
    this.autocomplete = new google.maps.places.Autocomplete(element, {
      componentRestrictions: {
        country: 'fr',
      },
    });

    google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
      const place = this.autocomplete.getPlace();

      if (place.geometry) {
        this.selectPlace(place);
      }
    });

    if (this.map) {
      this.autocomplete.bindTo('bounds', this.map);
    }
  }

  /**
   * @param {Element} element
   */
  initSearchBox(element) {
    this.autocomplete = new google.maps.places.SearchBox(element);

    google.maps.event.addListener(this.autocomplete, 'places_changed', () => {
      const place = this.autocomplete.getPlaces()[0] || null;

      if (place === null) {
        return;
      }

      if (place.geometry) {
        this.selectPlace(place);
      }
    });

    if (this.map) {
      this.autocomplete.bindTo('bounds', this.map);
    }
  }

  /**
   * @param {string} eventName
   * @param {Function} callback
   */
  addEventListener(eventName, callback) {
    this.eventListeners.push({ eventName, callback });
  }

  /**
   * @param {Location} location
   */
  addLocation(location) {
    const marker = MapUtils.createMarkerForLocation(location, this.config.marker);
    const infoWindow = MapUtils.createInfoWindowForLocation(location);
    /** @type MapServiceObject */
    const object = { location, marker, infoWindow };

    google.maps.event.addListener(marker, 'click', () => {
      this.closeInfoWindows();
      this.openInfoWindow(location);
    });

    if (this.config.marker.actionsOnMouseOver === true) {
      google.maps.event.addListener(marker, 'mouseover', () => {
        this.closeInfoWindows();
        this.openInfoWindow(location);
        scrollToLocation(location);
      });
    }

    this.addObject(object);
  }

  /**
   * @param {Object} position
   * @param {string} iconLocation
   */
  addMarkerLocation(position, iconLocation) {
    if (!this.config.marker.displaySearchMarker) {
      return;
    }

    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();
    const latlng = { lat: parseFloat(position.lat), lng: parseFloat(position.lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        const marker = new google.maps.Marker({
          icon: (iconLocation !== null) ? `/media/original/${iconLocation}` : MapService.ICON_DEFAULT_LOCATION,
          optimized: false,
          position: latlng,
          map: this.map,
        });
        this.markers = marker;
        infowindow.setContent(results[0].formatted_address);
        infowindow.open(this.map, marker);
      }
    });
  }

  /**
   * @param {string} address
   * @param {string} country
   */
  geocode(address, country) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({
      address,
      componentRestrictions: {
        country,
      },
    }, (results, status) => {
      if (status === 'OK') {
        const position = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          name: results[0].formatted_address,
        };

        this.emitEvent(MapService.POSITION_CHANGED, position);
      }
    });
  }

  deleteMarkerLocation() {
    if (!this.config.marker.displaySearchMarker) {
      return;
    }

    if (this.markers) {
      this.markers.setMap(null);
    }
  }

  /**
   * @private
   * @param {MapServiceObject} object
   */
  addObject(object) {
    this.objects.push(object);

    if (this.clusterer) {
      this.clusterer.addMarker(object.marker);
    } else {
      object.marker.setMap(this.map);
    }
  }

  /**
   * @param {Location} location
   */
  removeLocation(location) {
    const object = this.getObjectByLocation(location);

    if (object) {
      this.removeObject(object);
    }
  }

  /**
   * @private
   * @param {MapServiceObject} object
   */
  removeObject(object) {
    const objectIndex = this.objects.indexOf(object);

    if (objectIndex !== -1) {
      this.objects.splice(objectIndex, 1);
    }

    if (this.clusterer) {
      this.clusterer.removeMarker(object.marker);
    } else {
      object.marker.setMap(null);
    }
  }

  /**
   * @param {Location} location
   *
   * @returns {boolean}
   */
  hasLocation(location) {
    return !!this.getObjectByLocation(location);
  }

  /**
   * @private
   * @param {Location} location
   *
   * @return {?MapServiceObject}
   */
  getObjectByLocation(location) {
    return this.objects.filter(object => object.location.storeId === location.storeId)[0];
  }

  /**
   * @param {Location[]} locations
   */
  setLocations(locations) {
    const objects = [...this.objects];
    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const object = this.getObjectByLocation(location);
      const objectIndex = objects.indexOf(object);

      bounds.extend({ lat: location.lat, lng: location.lng });

      if (objectIndex !== -1) {
        objects.splice(objectIndex, 1);
      } else {
        this.addLocation(location);
      }
    });

    if (locations.length > 0) {
      const onBoundsChangedListener = google.maps.event.addListener(this.map, 'bounds_changed', () => {
        google.maps.event.removeListener(onBoundsChangedListener);
      });

      if (this.config.map.displayAllMarkers === true) {
        this.map.fitBounds(bounds);
      } else {
        let stop = false;
        while (!stop && this.map.getZoom() > this.config.map.defaultZoom) {
          for (let i = 0; i < locations.length; i += 1) {
            const marker = locations[i];
            const newMap = new google.maps.LatLng(parseFloat(marker.lat), parseFloat(marker.lng));
            if (this.map.getBounds().contains(newMap) === true) {
              stop = true;
            }
          }
          if (!stop) {
            this.map.setZoom(this.map.getZoom() - 1);
          }
        }
      }
    }

    objects.forEach((object) => {
      this.removeObject(object);
    });
  }

  /**
   * @param {Location} location
   */
  selectLocation(location) {
    if (!this.map) {
      throw new Error('Missing map instance. Use initMap() before.');
    }

    const object = this.getObjectByLocation(location);

    if (object) {
      this.map.setCenter(object.marker.position);
      this.map.setZoom(this.config.map.zoomAfterLocationSelect);

      this.closeInfoWindows();
      this.openInfoWindow(location);
    }
  }

  closeInfoWindows() {
    this.objects.forEach((object) => {
      object.infoWindow.close();
    });
  }

  /**
   * @param {Location} location
   */
  openInfoWindow(location) {
    const object = this.getObjectByLocation(location);

    if (object) {
      object.infoWindow.open(this.map, object.marker);
    }
  }

  /**
   * @param {google.maps.places.PlaceResult} place
   */
  selectPlace(place) {
    if (!this.map) {
      throw new Error('Missing map instance. Use initMap() before.');
    }

    if (place.geometry.viewport) {
      this.map.fitBounds(place.geometry.viewport);
    } else {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(this.config.map.zoomAfterUpdate);
    }

    const position = {
      name: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    this.emitEvent(MapService.POSITION_CHANGED, position);
  }

  /**
   * @param {Object} position
   * @param {number} position.lat
   * @param {number} position.lng
   * @param {Location} location
   * @returns {Promise.<number>}
   */
  getDistance(position, location) {
    return this.getDirectionsRepetitive(position, location).then(
      result => Promise.resolve(result.routes[0].legs[0].distance.value),
    );
  }

  destroyMap() {
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }
  }

  /**
   * @private
   * @param {string} eventName
   * @param {*} data
   */
  emitEvent(eventName, ...data) {
    this.eventListeners
      .filter(listener => listener.eventName === eventName)
      .forEach((listener) => {
        listener.callback(...data);
      });
  }

  /**
   * Persistently tries to get directions if OVER_QUERY_LIMIT or UNKNOWN_ERROR status was returned.
   *
   * @private
   * @param {Object} position
   * @param {number} position.lat
   * @param {number} position.lng
   * @param {Location} location
   * @param {number} delay
   * @param {number} tryCount
   * @returns {Promise.<google.maps.DirectionsResult>}
   */
  getDirectionsRepetitive(position, location, delay = 1000, tryCount = 3) {
    return this.getDirections(position, location).catch((error) => {
      if (['OVER_QUERY_LIMIT', 'UNKNOWN_ERROR'].indexOf(error) !== -1 && tryCount > 0) {
        return LocatorUtils.delayedPromise(delay).then(
          () => this.getDirectionsRepetitive(position, location, delay, tryCount - 1),
        );
      }

      return Promise.reject();
    });
  }

  /**
   * @private
   * @param {Object} position
   * @param {number} position.lat
   * @param {number} position.lng
   * @param {Location} location
   * @returns {Promise.<google.maps.DirectionsResult>}
   */
  getDirections(position, location) {
    let direction = _.find(this.directions, { locationId: location.storeId });

    if (direction === undefined) {
      direction = {
        locationId: location.storeId,
        results: [],
      };

      this.directions.push(direction);
    }

    const origin = {
      lat: position.lat,
      lng: position.lng,
    };

    let result = _.find(direction.results, origin);

    if (result !== undefined) {
      return Promise.resolve(result.data);
    }

    const config = {
      origin,
      destination: {
        lat: location.lat,
        lng: location.lng,
      },
      travelMode: 'DRIVING',
    };

    return new Promise((resolve, reject) => {
      this.directionService.route(config, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          result = {
            ...origin,
            data: response,
          };

          direction.results.push(result);

          resolve(response);
        } else {
          reject(status);
        }
      });
    });
  }
}

MapService.POSITION_CHANGED = 'POSITION_CHANGED';
MapService.ICON_DEFAULT_LOCATION = 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png';
