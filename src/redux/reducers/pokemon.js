import { 
  CONFIG_POKEMON_DISPLAY,
  SET_POKEMON_MOVES_PERSPECTIVE,
  SORT_POKEMON_MOVES,
  CONFIG_POKEMON_APPRAISAL,
  SORT_POKEMON_APPRAISAL,
  CONFIG_POKEMON_CP_FILTER
} from "../actions/pokemon"

/**
 * Pokemon reducer. Manages pokemon specific state.
 * @param {State} state
 * @param {Action} action
 * @return {State} state
 */
export default function (state = {}, action = {}) {
  switch (action.type) {
    case CONFIG_POKEMON_DISPLAY:
      return { ...state, display: action.props }

    case SET_POKEMON_MOVES_PERSPECTIVE:
      return { ...state, movesPerspective: action.view }

    case SORT_POKEMON_MOVES:
      return { ...state, movesSorter: action.sort }

    case CONFIG_POKEMON_APPRAISAL:
      return { ...state, appraisal: action.props }

    case SORT_POKEMON_APPRAISAL:
      return { ...state, appraisalSorter: action.sort }

    case CONFIG_POKEMON_CP_FILTER:
      return { ...state, cpFilter: action. props }

    default:
      return state
  }
}