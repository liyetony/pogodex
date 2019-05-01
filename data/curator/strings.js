import LineReader from "readline"
import { createReadStream } from "fs"

const FILE_PATH = "./assets/static_assets/txt/merged #6.txt"

/**
 * Process in-game text.
 * Updates dictionary of in-game text.
 * @param {Object} context - global context managing all data.
 * @return {Object} Promise - resolves upon completed task.
 */
export function loadStrings(context) {
  const { strings } = context
  return new Promise(resolve => {
    // text file stores key-value pairs in subsequent lines,
    // so keep track of key from previous line.
    let key

    const getQuotedText = text => text.substring(text.indexOf('"') + 1).slice(0, -1)

    LineReader.createInterface({ input: createReadStream(FILE_PATH) })
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