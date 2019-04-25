import { createSelector } from "reselect"
import { getPokemonList } from "./content"


/**
 * Get app search status.
 * @param {State} state
 * @returns {Boolean} app search status
 */
export const isSearching = state => state.session.search


/**
 * Get search query.
 * @param {State} state
 * @returns {String} search query
 */
export const getQuery = state => state.session.query


/**
 * Get list of pokemon that match search query.
 * @param {State} state
 * @returns {Array} list of relevant pokemon
 */
export const getQueriedPokemon = createSelector(
  [getQuery, getPokemonList],
  (query = "", list) => {
    const nameRegEx = new RegExp(`\\b${query}`, 'i')
    return !query.length ? [] : list
      .filter(({ pid, name }) => {
        let bid = pid.slice(0, 4)
        return name.match(nameRegEx) ||
          bid === query.padStart(4, 0)
      })
      .sort((p1, p2) =>
        p1.pid.localeCompare(p2.pid) ||
        p1.name.localeCompare(p2.name))
  }
)
