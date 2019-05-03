import LineReader from "readline"
import { createReadStream } from "fs"

/**
 * Process in-game text.
 * Updates dictionary of in-game text.
 * @param {Object} context - global context managing all data.
 * @return {Number} promise with total strings processed.
 */
export function loadStrings(context = {}) {
  const { paths, strings } = context
  
  if (!paths || !strings)
    throw "Invalid context provided"
    
  return new Promise(resolve => {
    // text file stores key-value pairs in subsequent lines,
    // so keep track of key from previous line.
    let key, total = 0

    const getQuotedText = text => text.substring(text.indexOf('"') + 1).slice(0, -1)

    LineReader.createInterface({ input: createReadStream(paths.textSrc) })
      .on("line", line => {
        line = line.trim()
        
        if (line.startsWith("string Key"))
          key = getQuotedText(line)
        
        if (line.startsWith("string Translation")) {
          strings[key] = getQuotedText(line)
          total++
        }
      })
      .on("close", () => resolve(total))
  })
}