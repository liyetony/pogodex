import { createSelector } from "reselect"
import { ROUTE, ROUTE_DESC } from "../../modules/session"


/**
 * Get snackbar info.
 * @param {State} state
 * @returns {Object} snackbar info
 */
export const getSnackbar = state => ({ ...state.session.snackbar }) || {}


/**
 * Get selected weather condition ID.
 * @param {State} state
 * @returns {Number} weather condition ID
 */
export const getWeatherCondition = state => state.session.weather


/**
 * Get selected page from route.
 * @param {State} state
 * @returns {String} selected page
 */
export const getPage = state => state.session.page || ROUTE.HOME


/**
 * Get selected pokemon ID.
 * @param {State} state
 * @returns {String} pokemon ID
 */
export const getPokemonId = state => state.session.pid


/**
 * Get page metadata for route.
 * @param {State} state
 * @returns {Object} page metadata
 */
export const getMetadata = createSelector(
  [getPage, getPokemonId],
  (page, pid) => {
    let image = "images/manifest/icon-144x144.png"
    let hash = ""

    switch (page) {
      case ROUTE.HOME:
      case ROUTE.POKEDEX:
      case ROUTE.APPRAISAL:
      case ROUTE.CP_FILTER:
        if (pid) {
          hash = `#${pid}`
          image = `${ROUTE.IMAGES.POKEMON}/${pid}.png`
        }
    }

    const title = `pogo${page}${hash}`
    const description = ROUTE_DESC[page]

    return { title, description, image }
  }
)
