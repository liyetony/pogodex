const FS = require("FS-extra")
const Listr = require("listr")

const Strings = require("./scripts/strings")
const Images = require("./scripts/images")
const Content = require("./scripts/content")

const keymapData = require("./scripts/content.keymap.json")
const mainData = require("./scripts/content.main.json")


/**
 * Global context managing all data
 * @constant
 * @type {Object}
 */
const context = {
  copyPokemonImages: !process.argv.includes("data"),
  appendHistory: process.argv.includes("save"),
  strings: {},
  images: {},
  keymap: keymapData,
  main: mainData,
  pokemonContent: {},
}


// create and execute series of tasks to complete update
const tasks = new Listr([
  { task: Strings.load,             title: "load strings" },
  { task: Images.updatePokemon,     title: "update pokemon images" },
  { task: Content.createKeymap,     title: "generate gamemaster keymap" },
  { task: Content.buildGamedata,    title: "build data from gamemaster file" },
  { task: exportData,               title: "export data" }
])
tasks.run(context).catch(err => console.error())



/**
 * Exports generated content and creates various logs:
 * @param  {Object} context - global context managing all data
 */
function exportData(context) {
  const { strings, keymap, main, pokemonContent } = context
  const listKeys = keymap => Object.keys(keymap).reduce((text, key) => `${text}${key}\n`, "")
  const timestamp = new Date().getTime()

  return Promise.all([
    // log strings & keymap for reference
    FS.outputJSON("logs/strings.json", strings),
    FS.outputJSON("logs/keymap.json", keymap),
    // create list of pokemon & move keys for updating spreadsheet
    FS.outputFile("data/keys.moves.csv", listKeys(keymap.moves)),
    FS.outputFile("data/keys.pokemon.csv", listKeys(keymap.pokemon)),
    // create content files for webapp
    FS.outputJSON("data/content.main.json", { timestamp, ...main }),
    FS.outputJSON("data/content.pokemon.json", pokemonContent),
    // append content files to update history
    ...context.appendHistory ? [
      FS.outputJSON(`data/versions/${timestamp}.main.json`, main),
      FS.outputJSON(`data/versions/${timestamp}.pokemon.json`, pokemonContent),
    ] : []
  ])
}