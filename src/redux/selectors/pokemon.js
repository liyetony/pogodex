import { createSelector } from "reselect"
import { getPokemonDict, getPokemonList } from "./content"
import { getPokemonId } from "./session"
import { pokemonImageFlag } from "../../../data/curator/flags";


/**
 * Get selected pokemon details. Invalid pokemon will have the property: valid = false.
 * @param {State} state
 * @returns {Object} pokemon details
 */
export const getPokemon = createSelector(
  [getPokemonDict, getPokemonList, getPokemonId],
  (dict, list, pid = "") => {
    const valid = pid in dict
    const bid = pid.slice(0, 4)
    const pokemon = {
      ...dict[bid] || {},
      ...dict[pid] || {}
    }
    const image = pokemon.img & pokemonImageFlag.extend ? bid : pid

    // find previous & next entry
    const index = list.findIndex(pokemon => pokemon.pid === pid)
    const prev = (list[index - 1] || {}).pid
    const next = (list[index + 1] || {}).pid

    return { valid, pid, image, ...pokemon, prev, next }
  }
)