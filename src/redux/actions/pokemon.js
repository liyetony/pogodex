import { debounce } from "../../modules/helper";

export const CONFIG_POKEMON_IMAGE_DISPLAY = "CONFIG_POKEMON_IMAGE_DISPLAY";
export const CONFIG_POKEMON_MOVE_LIST_DISPLAY =
  "CONFIG_POKEMON_MOVE_LIST_DISPLAY";
export const SORT_POKEMON_MOVES = "SORT_POKEMON_MOVES";
export const CONFIG_POKEMON_APPRAISAL = "CONFIG_POKEMON_APPRAISAL";
export const SORT_POKEMON_APPRAISAL = "SORT_POKEMON_APPRAISAL";
export const CONFIG_POKEMON_CP_FILTER = "CONFIG_POKEMON_CP_FILTER";

/**
 * Update pokemon image display.
 * @param {Object} props - image display properties.
 * @returns {Action} redux action
 */
export function configImageDisplay(props) {
  return { type: CONFIG_POKEMON_IMAGE_DISPLAY, props };
}

/**
 * Update pokemon move list display.
 * @param {Object} props - move list display properties.
 */
export function configMoveDisplay(props) {
  return { type: CONFIG_POKEMON_MOVE_LIST_DISPLAY, props };
}

/**
 * Sort pokemon move list.
 * @param {Array} sort - [sortKey, sortOrder]
 * @returns {Action} redux action
 */
export function sortMoves(sort) {
  return { type: SORT_POKEMON_MOVES, sort };
}

/* Debounced appraisal config */
const configAppraisalDebounced = debounce(
  (dispatch, props) => dispatch({ type: CONFIG_POKEMON_APPRAISAL, props }),
  200
);

/**
 * Configure pokemon appraisal.
 * @param {Object} props - appraisal configuration
 * @param {Boolean} debounce - whether or not to debounce search process. Defaults to false.
 * @returns {Action} redux action
 */
export function configAppraisal(props, debounce = false) {
  return debounce
    ? dispatch => configAppraisalDebounced(dispatch, props)
    : { type: CONFIG_POKEMON_APPRAISAL, props };
}

/**
 * Sort pokemon IV combiations from appraisal.
 * @param {Array} sort - [sortKey, sortOrder]
 * @returns {Action} redux action
 */
export function sortAppraisalIVCombos(sort) {
  return { type: SORT_POKEMON_APPRAISAL, sort };
}

/* Debounced cp filter configuration */
const configCPFilterDebounced = debounce(
  (dispatch, props) => dispatch({ type: CONFIG_POKEMON_CP_FILTER, props }),
  200
);

/**
 * Configure CP filter.
 * @param {Object} props - cp filter configuration
 * @param {Boolean} debounce - whether or not to debounce search process. Defaults to false.
 * @returns {Action} redux action
 */
export function configCPFilter(props, debounce = false) {
  return debounce
    ? dispatch => configCPFilterDebounced(dispatch, props)
    : { type: CONFIG_POKEMON_CP_FILTER, props };
}
