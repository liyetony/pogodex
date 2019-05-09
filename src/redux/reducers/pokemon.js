import { UPDATE_ROUTE } from "../actions/session";
import {
  CONFIG_POKEMON_IMAGE_DISPLAY,
  CONFIG_POKEMON_MOVE_LIST_DISPLAY,
  SORT_POKEMON_MOVES,
  CONFIG_POKEMON_APPRAISAL,
  SORT_POKEMON_APPRAISAL,
  CONFIG_POKEMON_CP_FILTER
} from "../actions/pokemon";

/**
 * Pokemon reducer. Manages pokemon specific state.
 * @param {State} state
 * @param {Action} action
 * @return {State} state
 */
export default function(state = {}, action = {}) {
  switch (action.type) {
    case UPDATE_ROUTE:
      return action.pid
        ? state
        : {
            ...state,
            display: undefined,
            moves: undefined,
            appraisal: undefined,
            cpFilter: undefined
          };

    case CONFIG_POKEMON_IMAGE_DISPLAY:
      return { ...state, display: action.props };

    case CONFIG_POKEMON_MOVE_LIST_DISPLAY:
      return { ...state, moves: action.props };

    case SORT_POKEMON_MOVES:
      return { ...state, moveSorter: action.sort };

    case CONFIG_POKEMON_APPRAISAL:
      return { ...state, appraisal: action.props };

    case SORT_POKEMON_APPRAISAL:
      return { ...state, appraisalSorter: action.sort };

    case CONFIG_POKEMON_CP_FILTER:
      return { ...state, cpFilter: action.props };

    default:
      return state;
  }
}
