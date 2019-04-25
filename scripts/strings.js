/**
 * Pokemon text content module.
 * @module ./scripts/content
 */

const FS = require("FS-extra")
const LineReader = require("readline")
const TEXT_FILE = "./assets/static_assets/txt/merged #6.txt"

/**
 * Generate keymap of game text.
 * @param {Object} context - global context managing all data
 */
exports.load = function(context) {
  let { strings } = context
  return new Promise(resolve => {
    /* text file stores key-value pairs in subsequent lines,
       so keep track of key from previous line. */
    let key

    const getQuotedText = text => text.substring(text.indexOf('"') + 1).slice(0, -1)

    LineReader.createInterface({ input: FS.createReadStream(TEXT_FILE) })
      .on("line", line => {
        line = line.trim()

        if (line.startsWith("string Key"))
          key = getQuotedText(line)

        if (line.startsWith("string Translation"))
          strings[key] = getQuotedText(line)
      })
      .on("close", () => resolve())
  })
}