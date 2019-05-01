/**
 * Default path configuration
 */
const pathConfig = {
  logDir: "logs",
  dataDir: "data",
  textSrc: "assets/static_assets/txt/merged #6.txt",
  pokemonImageSrcDir: "assets/pokemon_icons",
  pokemonImageOutDir:  "assets/pokemon",
  gamemasterSrc: "assets/gamemaster/gamemaster.json",
  exclusiveMovesUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq5HHNNYBD8ZJ5M2n-ebscY0j1LmV356tRLmRzAG3oXUr_IRg_hO4dOji6Eu8hZfuzzklh_kO7tDD_/pub?gid=0&single=true&output=csv"
}

/**
 * Keymap data structure.
 * Maps gamemaster keys to minified variants.
 */
const keymap = {
  types: {},
  weather: {},
  moves: {},
  pokemon: {},
  pokemonRarity: {
    "POKEMON_RARITY_MYTHIC": 1,
    "POKEMON_RARITY_LEGENDARY": 2
  }
}

/**
 * Main content data structure.
 * Manages most important app data.
 */
const content = {
  encounters: [
    { name: "wild" },
    { name: "quest" },
    { name: "hatch" },
    { name: "raid" }
  ],
  regions: [
    { name: "Unknown" },
    { name: "Kanto",  last: 151 },
    { name: "Johto",  last: 251 },
    { name: "Hoenn",  last: 386 },
    { name: "Sinnoh", last: 493 },
    { name: "Unova",  last: 649 },
    { name: "Kalos",  last: 721 },
    { name: "Alola",  last: 807 }
  ],
  weather: [
    { name: "clear" },
    { name: "partly cloudy" },
    { name: "overcast" },
    { name: "rainy" },
    { name: "snow" },
    { name: "windy" },
    { name: "fog" }
  ],
  types: [
    { name: "normal" },
    { name: "fighting" },
    { name: "flying" },
    { name: "poison" },
    { name: "ground" },
    { name: "rock" },
    { name: "bug" },
    { name: "ghost" },
    { name: "steel" },
    { name: "fire" },
    { name: "water" },
    { name: "grass" },
    { name: "electric" },
    { name: "psychic" },
    { name: "ice" },
    { name: "dragon" },
    { name: "dark" },
    { name: "fairy" }
  ],
  combat: {},
  upgrade: {},
  moves: {},
  pokemon: {}
}

/**
 * Global context managing all data.
 * @type {Object}
 */
export default {
  keymap,
  content,
  // pokemon related content to be lazily loaded
  pokemonContent: {},
  // manages all image variations for every pokemon
  pokemonImageFlags: {},
  // dictionary of in-game text
  strings: {},
  // templates that have not been processed while processing gamemaster
  ignoredTemplates: {}
}

/**
 * Create initial context.
 * @param {Object} paths - path configuration
 * @returns {Object} initial context
 */
export function initContext(paths = pathConfig) {
  return {
    paths,
    keymap,
    content,
    // pokemon related content to be lazily loaded
    pokemonContent: {},
    // manages all image variations for every pokemon
    pokemonImageFlags: {},
    // dictionary of in-game text
    strings: {},
    // templates that have not been processed while processing gamemaster
    ignoredTemplates: {}
  }
}