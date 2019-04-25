import { SET_THEME, SET_TEAM } from "../actions/settings"

/**
 * Settings reducer.
 * Manages app state that persists to local storage.
 * @param {State} state 
 * @param {Action} action 
 * @return {State} state
 */
export default function (state = {}, action = {}) {
  switch (action.type) {
    case SET_THEME:
      return { ...state, theme: action.theme }

    case SET_TEAM:
      return { ...state, team: action.team }
    
    default: return state
  }
}