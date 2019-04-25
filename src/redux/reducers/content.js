import {
  FETCH_MAIN_CONTENT, UPDATE_MAIN_CONTENT,
  FETCH_POKEMON_CONTENT, UPDATE_POKEMON_CONTENT
} from "../actions/content"
import { deepCopy } from "../modules/helper"

/**
 * Content reducer. Manages app content state.
 * @param {State} state
 * @param {Action} action
 * @return {State} state
 */
export default function (state = {}, action = {}) {
  switch (action.type) {
    case UPDATE_MAIN_CONTENT:
      return { ...state, ...action.data, ready: true }

    case UPDATE_POKEMON_CONTENT: {
      const pokemon = deepCopy(state.pokemon)
      const patches = Object.entries(action.data || {})

      patches.forEach(([pid, data]) => {
        pokemon[pid] = { ...pokemon[pid], ...data }
      })

      return { ...state, pokemon }
    }

    case FETCH_MAIN_CONTENT:
    case FETCH_POKEMON_CONTENT:
    default: return state
  }
}