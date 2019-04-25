export const SET_THEME = "SET_THEME"
export const SET_TEAM = "SET_TEAM"

/**
 * Change app theme.
 * @param {String} theme
 * @returns {Action} redux action
 */
export function setTheme(theme) {
  return { type: SET_THEME, theme };
}

/**
 * Change team.
 * @param {String} team
 * @returns {Action} redux action
 */
export function setTeam(team) {
  return { type: SET_TEAM, team }
}