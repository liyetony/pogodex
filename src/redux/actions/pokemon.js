import { debounce } from "../../modules/helper"

export const CONFIG_POKEMON_DISPLAY = "CONFIG_POKEMON_DISPLAY"
export const SET_POKEMON_MOVES_PERSPECTIVE = "SET_POKEMON_MOVES_PERSPECTIVE"
export const SORT_POKEMON_MOVES = "SORT_POKEMON_MOVES"
export const CONFIG_POKEMON_APPRAISAL = "CONFIG_POKEMON_APPRAISAL"
export const SORT_POKEMON_APPRAISAL = "SORT_POKEMON_APPRAISAL"
export const CONFIG_POKEMON_CP_FILTER = "CONFIG_POKEMON_CP_FILTER"


/**
 * Update pokemon image display.
 * @param {Object} props - pokemon image display properties.
 * @returns {Action} redux action
 */
export function configDisplay (props) {
  return { type: CONFIG_POKEMON_DISPLAY, props }
}


/**
 * Select what type of data to display for pokemon moves.
 * @param {String} view - pokemon move list perspective
 * @returns {Action} redux action
 */
export function setMovesPerspective(view) {
  return { type: SET_POKEMON_MOVES_PERSPECTIVE, view }
}


/**
 * Sort pokemon move list.
 * @param {Array} sort - [sortKey, sortOrder]
 * @returns {Action} redux action
 */
export function sortMoves(sort) {
  return { type: SORT_POKEMON_MOVES, sort }
}


/* Debounced appraisal config */
const configAppraisalDebounced = debounce((dispatch, props) =>
  dispatch({ type: CONFIG_POKEMON_APPRAISAL, props }), 200)

/**
 * Configure pokemon appraisal.
 * @param {Object} props - appraisal configuration
 * @param {Boolean} debounce - whether or not to debounce search process. Defaults to false.
 * @returns {Action} redux action
 */
export function configAppraisal(props, debounce = false) {
  return debounce
    ? dispatch => configAppraisalDebounced(dispatch, props)
    : { type: CONFIG_POKEMON_APPRAISAL, props }
}


/**
 * Sort pokemon IV combiations from appraisal.
 * @param {Array} sort - [sortKey, sortOrder]
 * @returns {Action} redux action
 */
export function sortAppraisalIVCombos(sort) {
  return { type: SORT_POKEMON_APPRAISAL }
}


/* Debounced cp filter configuration */
const configCPFilterDebounced = debounce((dispatch, props) =>
  dispatch({ type: CONFIG_POKEMON_CP_FILTER, props }), 200)

/**
 * Configure CP filter.
 * @param {Object} props - cp filter configuration
 * @param {Boolean} debounce - whether or not to debounce search process. Defaults to false.
 * @returns {Action} redux action
 */
export function configCPFilter(props, debounce = false) {
  return debounce
    ? dispatch => configCPFilterDebounced(dispatch, props)
    : { type: CONFIG_POKEMON_CP_FILTER, props }
}