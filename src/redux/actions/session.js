import { ROUTE, importPage } from "../../modules/session";
import { debounce } from "../../modules/helper";

export const UPDATE_ROUTE = "UPDATE_ROUTE";
export const OPEN_SNACKBAR = "OPEN_SNACKBAR";
export const CLOSE_SNACKBAR = "CLOSE_SNACKBAR";
export const SET_WEATHER = "SET_WEATHER";
export const APP_SEARCH = "APP_SEARCH";
export const CANCEL_SEARCH = "CANCEL_SEARCH";

/**
 * Use URL to update route.
 * @param {Location} location - window.location object
 * @returns {Action} redux action
 */
export function updateRoute(location) {
  const routes = Object.values(ROUTE);
  const update = {};

  let path = window.decodeURIComponent(location.pathname);
  let hash = window.decodeURIComponent(location.hash).slice(1);

  return dispatch => {
    switch (path) {
      case ROUTE.POKEDEX:
      case ROUTE.APPRAISAL:
      case ROUTE.CP_FILTER:
        update.pid = hash;
    }

    update.page = importPage(path, hash);
    dispatch({ type: UPDATE_ROUTE, update });
  };
}

let snackbarTimer;

/**
 * Show a temporary snackbar message.
 * @param {String} msg - snackbar message
 * @returns {Action} redux action
 */
export function showSnackbar(msg) {
  return dispatch => {
    dispatch({ type: OPEN_SNACKBAR, msg });
    window.clearTimeout(snackbarTimer);
    snackbarTimer = window.setTimeout(
      () => dispatch({ type: CLOSE_SNACKBAR }),
      1500
    );
  };
}

/**
 * Change weather.
 * @param {Number} wid - weather ID
 * @returns {Action} redux action
 */
export function setWeather(wid) {
  return { type: SET_WEATHER, wid };
}

/* Debounced app search functionality */
const appSearchDebounced = debounce(
  (dispatch, query) => dispatch({ type: APP_SEARCH, query }),
  200
);

/**
 * Search app.
 * @param {String} query
 * @param {Boolean} debounce - whether or not to debounce search process. Defaults to false.
 * @returns {Action} redux action
 */
export function appSearch(query, debounce = false) {
  import("../../components/app-search.js");
  return debounce
    ? dispatch => appSearchDebounced(dispatch, query)
    : { type: APP_SEARCH, query };
}

/**
 * Cancel app search.
 * @returns {Action} redux action
 */
export function cancelSearch() {
  return { type: CANCEL_SEARCH };
}
