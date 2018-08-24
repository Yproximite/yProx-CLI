import { Location } from '../model';

function evalIconCallback(rawCallback) {
  let callback = null;

  try {
    callback = eval(`(${rawCallback})`); // eslint-disable-line no-eval
  } catch (err) {} // eslint-disable-line no-empty

  return callback;
}

/**
 * @param {Object} hit
 *
 * @return Location
 */
function mapSearchHit(hit) {
  const location = new Location();
  location.lat = hit._geoloc.lat; // eslint-disable-line no-underscore-dangle
  location.lng = hit._geoloc.lng; // eslint-disable-line no-underscore-dangle
  location.icon = hit.icon;
  location.iconCallback = hit.marker_callback ? evalIconCallback(hit.marker_callback) : null;
  location.content = hit.marker_information;
  location.storeId = hit.objectID;
  location.siteId = hit.site_id;
  location.url = hit.url;
  location.title = hit.title;
  location.phone = hit.telephone;
  location.address = hit.address;
  location.distance = null; // will be calculated after
  // eslint-disable-next-line no-underscore-dangle
  location.rankingInfo = hit._rankingInfo;

  return location;
}

export class LocatorUtils {
  /**
   * @param {SearchResults} result
   * @returns Location[]
   */
  static getLocationsFromResult(result) {
    return result.hits.map(hit => mapSearchHit(hit));
  }

  /**
   * @param {number} delay
   * @returns {Promise}
   */
  static delayedPromise(delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  /**
   * @returns {Promise.<Position>}
   */
  static getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject();

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        () => {
          reject();
        },
      );
    });
  }
}
