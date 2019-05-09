import { THEME } from "../../modules/settings";

/**
 * Get app theme.
 * @returns {String} app theme
 */
export const getTheme = state => state.settings.theme || THEME.LIGHT;

/**
 * Get selected team.
 * @returns {String} selected team
 */
export const getTeam = state => state.settings.team || 0;
