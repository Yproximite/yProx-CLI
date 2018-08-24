import * as _ from 'lodash';
import google from 'google';

export class MapUtils {
  /**
   * @param {number} lat
   * @param {number} lng
   *
   * @returns {google.maps.LatLng}
   */
  static createLatLng(lat, lng) {
    return new google.maps.LatLng(lat, lng);
  }

  /**
   * @param {Location} location
   * @param {?string} defaultIcon
   *
   * @returns {?string}
   */
  static getIconUrl(location, defaultIcon = null) {
    if (location.iconCallback) {
      const iconPath = location.iconCallback();

      if (iconPath) {
        return iconPath;
      }
    }

    const iconName = location.icon ? location.icon : defaultIcon;

    return iconName ? `/media/original/${iconName}` : null;
  }

  /**
   * @param {Location} location
   * @param {Object} config
   * @param {?string} config.defaultIcon
   *
   * @returns {google.maps.Marker}
   */
  static createMarkerForLocation(location, config = {}) {
    let icon;
    const iconUrl = MapUtils.getIconUrl(location, config.defaultIcon);

    if (iconUrl) {
      if (_.isObject(iconUrl)) {
        icon = {
          url: iconUrl.src,
          size: new google.maps.Size(iconUrl.width, iconUrl.height),
          scaledSize: new google.maps.Size(iconUrl.width, iconUrl.height),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(Math.round(iconUrl.width / 2), iconUrl.height),
        };
      } else if (_.isString(iconUrl)) {
        icon = iconUrl;
      }
    }

    const options = {
      icon,
      position: MapUtils.createLatLng(location.lat, location.lng),
      optimized: true,
      shadowStyle: 1,
      padding: 0,
      backgroundColor: 'rgb(57,57,57)',
      borderRadius: 4,
      arrowSize: 10,
      borderWidth: 1,
      borderColor: '#2c2c2c',
      disableAutoPan: true,
      hideCloseButton: true,
      arrowPosition: 30,
      arrowStyle: 2,
      scaledSize: 5,
    };

    return new google.maps.Marker(options);
  }

  /**
   * @param {Location} location
   *
   * @returns {google.maps.InfoWindow}
   */
  static createInfoWindowForLocation(location) {
    return new google.maps.InfoWindow({ content: location.content });
  }

  /**
   * @param {Element} element
   * @param {Object} config
   * @param {string} config.element
   * @param {number} config.centerLat
   * @param {number} config.centerLng
   * @param {number} config.defaultZoom
   * @param {Array}  styles

   * @returns {google.maps.Map}
   */
  static createMap(element, config = {}, styles = []) {
    const center = MapUtils.createLatLng(config.centerLat, config.centerLng);

    const options = {
      center,
      styles,
      zoom: config.defaultZoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    return new google.maps.Map(element, options);
  }
}
