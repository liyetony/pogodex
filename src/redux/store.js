import { createStore, compose, combineReducers, applyMiddleware } from "redux"
import { lazyReducerEnhancer } from "pwa-helpers/lazy-reducer-enhancer"
import thunk from "redux-thunk"
import content from "./reducers/content"
import settings from "./reducers/settings"
import session from "./reducers/session"

const devCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(
  state => state,
  loadState(),
  devCompose(
    lazyReducerEnhancer(combineReducers),
    applyMiddleware(thunk)
  )
)

store.subscribe(() => saveState(store.getState()))
store.addReducers({ content, settings, session })


/* Load state from local and session storage. */
function loadState() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  const session = JSON.parse(sessionStorage.getItem('session') || '{}')
  return { settings, session }
  return {}
}

/**
 * Persist session and setting states.
 * @param {State} state
 */
function saveState(state) {
  localStorage.setItem('settings', JSON.stringify(state.settings || {}))
  sessionStorage.setItem('session', JSON.stringify(state.session || {}))
}