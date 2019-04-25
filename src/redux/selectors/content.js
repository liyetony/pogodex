import { createSelector } from "reselect"
import { deepCopy } from "../modules/helper"

/**
 * Get content availability status.
 * @param {State} state
 * @returns {Boolean} content ready status
 */
export const isContentReady = state => state.content.ready


/**
 * Get content timestamp.
 * @param {State} state
 * @returns {Number} content timestamp
 */
export const getTimestamp = state =>
  new Date(state.content.timestamp).toString()


/**
 * Get CP multipliers.
 * @param {State} state
 * @returns {Array} CP multipliers
 */
export const getCPMultipliers = createSelector(
  [state => state.content.upgrade],
  (upgrade = {}) => [...upgrade.cpMultipliers || []]
)


/**
 * Get stardust costs.
 * @param {State} state
 * @returns {Array} stardust costs.
 */
export const getStardustCosts = createSelector(
  [state => state.content.upgrade],
  (upgrade = {}) => [...upgrade.stardustCosts || []]
)


/**
 * Get stardust cost multiplier for lucky pokemon.
 * @param {State} state
 * @returns {Number} stardust cost scalar.
 */
export const getStardustLuckyMultiplier = createSelector(
  [state => state.content.upgrade],
  (upgrade = {}) => upgrade.stardustCostLuckyScalar
)


/**
 * Get list of pokemon types.
 * @param {State} state
 * @returns {Array} pokemon types
 */
export const getTypeList = createSelector(
  [state => state.content.types],
  (list = []) => deepCopy(list)
)


/**
 * Get list of weather conditions.
 * @param {State} state
 * @returns {Array} weather conditions.
 */
export const getWeatherList = createSelector(
  [state => state.content.weather],
  (list = []) => deepCopy(list)
)


/**
 * Get move power multiplier from weather bonus
 * @param {State} state
 * @returns {Number} weather scalar
 */
export const getWeatherScalar = createSelector(
  [state => state.content.combat],
  (combat = {}) => combat.attackMultiplierFromWeather || 1
)


/**
 * Get list of pokemon encounter types.
 * @param {State} state
 * @returns {Array} pokemon encounters
 */
export const getEncounterList = createSelector(
  [state => state.content.encounters],
  (encounters = []) => deepCopy(encounters)
)


/**
 * Get info for wild pokemon encounter
 * @param {State} state
 * @returns {Object} wild pokemon encounter info
 */
export const getWildEncounter = createSelector(
  [getEncounterList],
  list => list.find(enc => enc.type = "wild") || {}
)


/**
 * Get pokemon dictionary.
 * @param {State} state
 * @returns {Object} pokemon dictionary
 */
export const getPokemonDict = createSelector(
  [state => state.content.pokemon],
  (dict = {}) => deepCopy(dict)
)


/**
 * Get list of pokemon names and IDs.
 * @param {State} state
 * @returns {Array} list of pokemon names and IDs.
 */
export const getPokemonList = createSelector(
  [getPokemonDict],
  dict => Object.entries(dict)
    .filter(([pid, pokemon]) => !pokemon.base)
    .map(([pid, { name }]) => {
      const bid = pid.slice(0,4)
      const fid = pid.slice(4)
      return { pid, bid, fid, name }
    })
    .sort((p1, p2) => p1.bid - p2.bid || p1.fid - p2.fid)
)


/**
 * Get moves dictionary.
 * @param {State} state
 * @returns {Object} moves dictionary
 */
export const getMovesDict = createSelector(
  [state => state.content.moves],
  (dict = {}) => deepCopy(dict)
)