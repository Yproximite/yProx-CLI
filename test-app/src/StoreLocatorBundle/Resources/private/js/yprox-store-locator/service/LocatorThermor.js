import { filter, orderBy } from 'lodash';

export class LocatorThermor {
  /**
   * @param {Object} data
   * @param {boolean} nearest
   * @param  {integer} breakPoint
   * @returns {boolean}
   */
  static breakDistance(data, nearest = true, breakPoint = 20000) {
    const { distance } = data.rankingInfo.matchedGeoLocation;

    return nearest ? distance <= breakPoint : distance > breakPoint;
  }

  /**
   * @param {Array} locations
   * @param {Array} iteratees
   * @param {Array} directions
   * @returns {Array}
   */
  static orderElements(locations, iteratees, directions) {
    let nearestLocations = filter(locations, location => this.breakDistance(location));
    let mostDistantLocations = filter(locations, location => this.breakDistance(location, false));

    nearestLocations = orderBy(nearestLocations, iteratees, directions);
    mostDistantLocations = orderBy(mostDistantLocations, iteratees, directions);

    return nearestLocations.concat(mostDistantLocations);
  }
}
