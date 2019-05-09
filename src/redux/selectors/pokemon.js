import { createSelector } from "reselect";
import { getPokemonDict, getPokemonList } from "./content";
import { getPokemonId } from "./session";
import { pokemonImageFlag } from "../../../data/curator/flags";

/**
 * Get selected pokemon details. Invalid pokemon will have the property: valid = false.
 * @returns {Object} pokemon details
 */
export const getPokemon = createSelector(
  [getPokemonDict, getPokemonList, getPokemonId],
  (dict, list, pid = "") => {
    const valid = pid in dict;
    const bid = pid.slice(0, 4);
    const pokemon = {
      ...(dict[bid] || {}),
      ...(dict[pid] || {})
    };
    const image = pokemon.img & pokemonImageFlag.extend ? bid : pid;

    // visual variants
    const altShiny = pokemon.img & pokemonImageFlag.shiny;
    const altGender = pokemon.img & pokemonImageFlag.gender;

    // find previous & next entry
    const index = list.findIndex(pokemon => pokemon.pid === pid);
    const prev = list[index - 1] || {};
    const next = list[index + 1] || {};

    return {
      valid,
      pid,
      image,
      altShiny,
      altGender,
      ...pokemon,
      prev,
      next
    };
  }
);
