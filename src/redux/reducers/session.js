import {
  UPDATE_ROUTE,
  SET_WEATHER,
  OPEN_SNACKBAR, CLOSE_SNACKBAR,
  APP_SEARCH, CANCEL_SEARCH
} from "../actions/session"

/**
 * Session reducer.
 * Manages app state that persists to session storage.
 * @param {State} state
 * @param {Action} action
 * @return {State} state
 */
export default function (state = {}, action = {}) {
  switch (action.type) {
    case UPDATE_ROUTE:
      return { ...state, ...action.update, pageOld: state.page, search: false }

    case APP_SEARCH:
      return { ...state, query: action.query, search: true }

    case CANCEL_SEARCH:
      return { ...state, query: "", search: false }
    
    case SET_WEATHER:
      return { ...state, weather: action.wid }

    case OPEN_SNACKBAR:
      return { ...state, snackbar: { msg: action.msg, show: true } }

    case CLOSE_SNACKBAR:
      return { ...state, snackbar: { ...state.snackbar, show: false } }

    default: return state
  }
}