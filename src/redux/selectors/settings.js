import { THEME } from "../modules/settings"


/**
 * Get app theme.
 * @param {State} state
 * @returns {String} app theme
 */
export const getTheme = state => state.settings.theme || THEME.LIGHT

/**
 * Get selected team.
 * @param {State} state
 * @returns {String} selected team
 */
export const getTeam = state => state.settings.team || 0
