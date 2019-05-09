import { createSelector } from "reselect";
import { ROUTE, ROUTE_DESC } from "../../modules/session";

/**
 * Get snackbar info.
 * @returns {Object} snackbar info
 */
export const getSnackbar = state => ({ ...state.session.snackbar } || {});

/**
 * Get selected weather condition ID.
 * @returns {Number} weather condition ID
 */
export const getWeatherCondition = state => state.session.weather;

/**
 * Get selected page from route.
 * @returns {String} selected page
 */
export const getPage = state => state.session.page || ROUTE.HOME;

/**
 * Get selected pokemon ID.
 * @returns {String} pokemon ID
 */
export const getPokemonId = state => state.session.pid;

/**
 * Get page metadata for route.
 * @returns {Object} page metadata
 */
export const getMetadata = createSelector(
  [getPage, getPokemonId],
  (page, pid) => {
    let image = "images/manifest/icon-144x144.png";
    let hash = "";

    switch (page) {
      case ROUTE.HOME:
      case ROUTE.POKEDEX:
      case ROUTE.APPRAISAL:
      case ROUTE.CP_FILTER:
        if (pid) {
          hash = `#${pid}`;
          image = `${ROUTE.IMAGES.POKEMON}/${pid}.png`;
        }
    }

    const title = `pogo${page}${hash}`;
    const description = ROUTE_DESC[page];

    return { title, description, image };
  }
);
