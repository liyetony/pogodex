import { createSelector } from "reselect"
import { getPokemonDict, getPokemonList } from "./content"
import { getPokemonId } from "./session"


/**
 * Get selected pokemon details. Invalid pokemon will have the property: valid = false.
 * @param {State} state
 * @returns {Object} pokemon details
 */
export const getPokemon = createSelector(
  [getPokemonDict, getPokemonList, getPokemonId],
  (dict, list, pid) => {
    let valid = pid in dict
    let pokemon = dict[pid] || {}
    let base = {}

    // mix in base information
    if (pid.length > 4)
      base = dict[pid.slice(0, 4)] || {}

    // find previous & next entry
    const index = list.findIndex(pokemon => pokemon.pid === pid)
    const prev = (list[index - 1] || {}).pid
    const next = (list[index + 1] || {}).pid

    return { valid, pid, ...base, ...pokemon, prev, next }
  }
)