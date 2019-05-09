import { createSelector } from "reselect";
import { deepCopy } from "../../modules/helper";
import { pokemonImageFlag } from "../../../data/curator/flags";

/**
 * Get content availability status.
 * @returns {Boolean} content ready status
 */
export const isContentReady = state => state.content.ready;

/**
 * Get content timestamp.
 * @returns {Number} content timestamp
 */
export const getTimestamp = state =>
  new Date(state.content.timestamp).toString();

/**
 * Get CP multipliers.
 * @returns {Array} CP multipliers
 */
export const getCPMultipliers = createSelector(
  [state => state.content.upgrade],
  (upgrade = {}) => [...(upgrade.cpMultipliers || [])]
);

/**
 * Get stardust costs.
 * @returns {Array} stardust costs.
 */
export const getStardustCosts = createSelector(
  [state => state.content.upgrade],
  (upgrade = {}) => [...(upgrade.stardustCosts || [])]
);

/**
 * Get stardust cost multiplier for lucky pokemon.
 * @returns {Number} stardust cost scalar.
 */
export const getStardustLuckyMultiplier = createSelector(
  [state => state.content.upgrade],
  (upgrade = {}) => upgrade.stardustCostLuckyScalar
);

/**
 * Get list of pokemon types.
 * @returns {Array} pokemon types
 */
export const getTypeList = createSelector(
  [state => state.content.types],
  (list = []) => deepCopy(list)
);

/**
 * Get list of weather conditions.
 * @returns {Array} weather conditions.
 */
export const getWeatherList = createSelector(
  [state => state.content.weather],
  (list = []) => deepCopy(list)
);

/**
 * Get move power multiplier from weather bonus
 * @returns {Number} weather scalar
 */
export const getWeatherScalar = createSelector(
  [state => state.content.combat],
  (combat = {}) => combat.attackMultiplierFromWeather || 1
);

/**
 * Get list of pokemon encounter types.
 * @returns {Array} pokemon encounters
 */
export const getEncounterList = createSelector(
  [state => state.content.encounters],
  (encounters = []) => deepCopy(encounters)
);

/**
 * Get info for wild pokemon encounter
 * @returns {Object} wild pokemon encounter info
 */
export const getWildEncounter = createSelector(
  [getEncounterList],
  list => list.find(enc => (enc.name = "wild")) || {}
);

/**
 * Get pokemon dictionary.
 * @returns {Object} pokemon dictionary
 */
export const getPokemonDict = createSelector(
  [state => state.content.pokemon],
  (dict = {}) => deepCopy(dict)
);

/**
 * Get list of pokemon names and IDs.
 * @returns {Array} list of pokemon names and IDs.
 */
export const getPokemonList = createSelector(
  [getPokemonDict],
  dict =>
    Object.keys(dict)
      .filter(pid => !dict[pid].extend)
      .map(pid => {
        const pokemon = dict[pid];
        const bid = pid.slice(0, 4);
        const fid = pid.slice(4);
        const image = pokemon.img & pokemonImageFlag.extend ? bid : pid;
        return { pid, bid, fid, image, name: pokemon.name };
      })
      .sort((p1, p2) => p1.bid - p2.bid || p1.fid - p2.fid)
);

/**
 * Get moves dictionary.
 * @returns {Object} moves dictionary
 */
export const getMovesDict = createSelector(
  [state => state.content.moves],
  (dict = {}) => deepCopy(dict)
);
