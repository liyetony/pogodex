import fs from "fs-extra"
import Listr from "listr"
import context from "./data/curator/context.js"
import { loadStrings } from "./data/curator/strings.js"
import { updatePokemonImages } from "./data/curator/images.js"
import { updateKeymap, buildContent } from "./data/curator/content.js"

// create and execute series of tasks to complete update
const tasks = new Listr([
  { task: loadStrings,              title: "load strings" },
  { task: updatePokemonImages,      title: "update pokemon images" },
  { task: updateKeymap,             title: "update gamemaster keymap" },
  { task: buildContent,             title: "build data from gamemaster file" },
  { task: exportData,               title: "export data" }
])
tasks.run(context).catch(err => console.error())

/**
 * Exports game data and creates various logs:
 * @param  {Object} context - global context managing all data
 * @return {Object} Promise - resolves upon completed task.
 */
function exportData(context) {
  const listKeys = keymap => Object.keys(keymap).reduce((text, key) => `${text}${key}\n`, "")
  const timestamp = new Date().getTime()

  const tasks = [
    // logs
    fs.ensureDir("logs"),
    fs.outputJSON("logs/strings.json", context.strings),
    fs.outputJSON("logs/keymap.json", context.keymap),
    fs.outputJSON("logs/pokemonImageFlags.json", context.pokemonImageFlags),
    fs.outputJSON("logs/ignoredTemplates.json", context.ignoredTemplates),
    // key lists
    fs.ensureDir("data/keys"),
    fs.outputFile("data/keys/moves.csv", listKeys(context.keymap.moves)),
    fs.outputFile("data/keys/pokemon.csv", listKeys(context.keymap.pokemon)),
    fs.ensureDir("data/history")
  ]

  // export main content
  if (isNewContent(context.content, "data/content.json")) {
    const data = { timestamp, ...context.content }
    tasks.push(fs.outputJSON("data/content.json", data))
    tasks.push(fs.outputJSON(`data/history/${timestamp}.content.json`, data))
    tasks.push(fs.outputJSON("data/timestamp.json", { timestamp }))
  }

  // export pokemon content
  if (isNewContent(context.pokemonContent, "data/content.pokemon.json")) {
    tasks.push(fs.outputJSON("data/content.pokemon.json", context.pokemonContent))
    tasks.push(fs.outputJSON(`data/history/${timestamp}.content.pokemon.json`, context.pokemonContent))
  }

  return Promise.all(tasks)
}


/**
 * Determine if data is different from JSON file content.
 * Omits JSON file timestamp property for comparison.
 * @param {Object} data - content data.
 * @param {String} file - path to JSON content file.
 * @returns {Boolean} whether content is new in comparison to content file.
 */
function isNewContent(data, file) {
  let oldData, newData = JSON.stringify(data)
  try {
    const { timestamp, ...json } = fs.readJSONSync(file)
    oldData = JSON.stringify(json)
  }
  catch (err) { }
  return newData !== oldData
}