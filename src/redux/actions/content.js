export const FETCH_MAIN_CONTENT = "FETCH_MAIN_CONTENT";
export const UPDATE_MAIN_CONTENT = "UPDATE_MAIN_CONTENT";
export const FETCH_POKEMON_CONTENT = "FETCH_POKEMON_CONTENT";
export const UPDATE_POKEMON_CONTENT = "UPDATE_POKEMON_CONTENT";

/**
 * Content filepaths.
 * @constant
 * @readonly
 * @type {Object}
 */
export const CONTENT_URL = {
  MAIN: "/data/content.json",
  POKEMON: "/data/content.pokemon.json"
};

/**
 * Load app content.
 * @returns {Action} redux action
 */
export function loadMainContent() {
  return dispatch => {
    dispatch({ type: FETCH_MAIN_CONTENT });
    fetch(CONTENT_URL.MAIN)
      .then(response => response.json())
      .then(data => dispatch({ type: UPDATE_MAIN_CONTENT, data }));
  };
}

/**
 * Update app content with additional pokemon details.
 * @returns {Action} redux action
 */
export function loadPokemonContent() {
  return dispatch => {
    dispatch({ type: FETCH_POKEMON_CONTENT });
    fetch(CONTENT_URL.POKEMON)
      .then(response => response.json())
      .then(data => dispatch({ type: UPDATE_POKEMON_CONTENT, data }));
  };
}
