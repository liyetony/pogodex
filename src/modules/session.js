/**
 * Routes
 * @constant
 * @readonly
 * @type {Object}
 */
export const ROUTE = {
  HOME: "/",
  MENU: "/menu",
  ERROR: "/404",
  SETTINGS: "/settings",
  POKEDEX: "/pokedex",
  APPRAISAL: "/appraisal",
  CP_FILTER: "/cpfilter",
  IMAGES: {
    POKEMON: "/images/pokemon",
    TYPE: "/images/types",
    TEAM: "/images/teams"
  }
}

/**
 * Route descriptions.
 * @constant
 * @readonly
 * @type {Object}
 */
export const ROUTE_DESC = {
  [ROUTE.HOME]: "home",
  [ROUTE.MENU]: "app menu",
  [ROUTE.ERROR]: "page not found",
  [ROUTE.SETTINGS]: "app settings",
  [ROUTE.POKEDEX]: "pokemon details",
  [ROUTE.APPRAISAL]: "appraise pokemon",
  [ROUTE.CP_FILTER]: "generate pokemon cp filter",
}

/**
 * Dynamically import es module based on route.
 * @param {String} path - route path
 * @param {String} hash - route hash
 * @returns {String} modified path
 */
export function importPage(path, hash) {
  switch (path) {
    case ROUTE.HOME:
      break
    case ROUTE.POKEDEX:
      if (hash)
        import("../components/pokemon-entry.js")
      else
        import("../components/pokemon-list.js")
      break
    case ROUTE.APPRAISAL:
      import("../components/pokemon-appraisal.js")
      break
    case ROUTE.CP_FILTER:
      import("../components/pokemon-cpfilter.js")
      break
    case ROUTE.SETTINGS:
      import("../components/app-settings.js")
      break
    default:
      import("../components/app-error.js")
      path = ROUTE.ERROR
  }
  return path
}