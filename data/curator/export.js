import fs from "fs-extra"
/**
 * Exports game data and creates various logs:
 * @param  {Object} context - global context managing all data
 * @return {Number} promise with content update timestamp.
 */
export function exportData(context = {}) {
  const {
    paths, strings, keymap, pokemonImageFlags, 
    ignoredTemplates, content, extra
  } = context

  if (!paths || !strings || !keymap || !pokemonImageFlags 
    || !ignoredTemplates || !content || !extra)
    throw "Invalid context provided"

  const { logDir, dataDir } = paths
  const listKeys = keymap => Object.keys(keymap).reduce((text, key) => `${text}${key}\n`, "")
  const timestamp = new Date().getTime()

  const tasks = [
    // logs
    fs.ensureDir(logDir),
    fs.outputJSON(`${logDir}/strings.json`, strings),
    fs.outputJSON(`${logDir}/keymap.json`, keymap),
    fs.outputJSON(`${logDir}/pokemonImageFlags.json`, pokemonImageFlags),
    fs.outputJSON(`${logDir}/ignoredTemplates.json`, ignoredTemplates),
    // key lists
    fs.ensureDir(`${dataDir}/keys`),
    fs.outputFile(`${dataDir}/keys/moves.csv`, listKeys(keymap.moves)),
    fs.outputFile(`${dataDir}/keys/pokemon.csv`, listKeys(keymap.pokemon)),
    fs.ensureDir(`${dataDir}/history`)
  ]

  // export main content
  if (isNewContent(content, `${dataDir}/content.json`)) {
    const data = { timestamp, ...content }
    tasks.push(fs.outputJSON(`${dataDir}/timestamp.json`, { timestamp }))
    tasks.push(fs.outputJSON(`${dataDir}/content.json`, data))
    tasks.push(fs.outputJSON(`${dataDir}/history/${timestamp}.content.json`, data))
  }

  // export pokemon content
  if (isNewContent(extra.pokemon, `${dataDir}/content.pokemon.json`)) {
    tasks.push(fs.outputJSON(`${dataDir}/content.pokemon.json`, extra.pokemon))
    tasks.push(fs.outputJSON(`${dataDir}/history/${timestamp}.content.pokemon.json`, extra.pokemon))
  }

  return new Promise(resolve => Promise.all(tasks).then(() => resolve(timestamp)))
}


/**
 * Determine if data is different from JSON file content.
 * Omits JSON file timestamp property for comparison.
 * @param {Object} data - content data.
 * @param {String} file - path to JSON content file.
 * @returns {Boolean} whether content is new in comparison to content file.
 */
export function isNewContent(data, file) {
  let oldData, newData = JSON.stringify(data)
  try {
    const { timestamp, ...json } = fs.readJSONSync(file)
    oldData = JSON.stringify(json)
  }
  catch (err) { }
  return newData !== oldData
}