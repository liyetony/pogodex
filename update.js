import fs from "fs-extra"
import Listr from "listr"
import { initContext } from "./data/curator/context.js"
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
tasks.run(initContext()).catch(err => console.error())

/**
 * Exports game data and creates various logs:
 * @param  {Object} context - global context managing all data
 * @return {Object} Promise - resolves upon completed task.
 */
function exportData(context) {
  const { logDir, dataDir } = context.paths
  const listKeys = keymap => Object.keys(keymap).reduce((text, key) => `${text}${key}\n`, "")
  const timestamp = new Date().getTime()

  const tasks = [
    // logs
    fs.ensureDir(logDir),
    fs.outputJSON(`${logDir}/strings.json`, context.strings),
    fs.outputJSON(`${logDir}/keymap.json`, context.keymap),
    fs.outputJSON(`${logDir}/pokemonImageFlags.json`, context.pokemonImageFlags),
    fs.outputJSON(`${logDir}/ignoredTemplates.json`, context.ignoredTemplates),
    // key lists
    fs.ensureDir(`${dataDir}/keys`),
    fs.outputFile(`${dataDir}/keys/moves.csv`, listKeys(context.keymap.moves)),
    fs.outputFile(`${dataDir}/keys/pokemon.csv`, listKeys(context.keymap.pokemon)),
    fs.ensureDir(`${dataDir}/history`)
  ]

  // export main content
  if (isNewContent(context.content, `${dataDir}/content.json`)) {
    const data = { timestamp, ...context.content }
    tasks.push(fs.outputJSON(`${dataDir}/timestamp.json`, { timestamp }))
    tasks.push(fs.outputJSON(`${dataDir}/content.json`, data))
    tasks.push(fs.outputJSON(`${dataDir}/history/${timestamp}.content.json`, data))
  }

  // export pokemon content
  if (isNewContent(context.pokemonContent, `${dataDir}/content.pokemon.json`)) {
    tasks.push(fs.outputJSON(`${dataDir}/content.pokemon.json`, context.pokemonContent))
    tasks.push(fs.outputJSON(`${dataDir}/history/${timestamp}.content.pokemon.json`, context.pokemonContent))
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