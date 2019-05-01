import fs from "fs-extra"
import streamEqual from "stream-equal"
import { pokemonImageFlag } from "./flags.js"

const POKEMON_SRCDIR = "./assets/pokemon_icons"
const POKEMON_OUTDIR = "./images/pokemon"

/**
 * Process pokemon images.
 * Updates dictionary managing pokemon image variations.
 * Copy & rename updated pokemon images from assets.
 * @param {Object} context - global context managing all data.
 * @return {Object} Promise - resolves upon completed task.
 */
export function updatePokemonImages(context) {
  const { pokemonImageFlags } = context
  const tasks = []

  fs.ensureDirSync(POKEMON_OUTDIR)
  fs.readdirSync(POKEMON_SRCDIR).forEach(file => {
    // get ids from file name
    let [baseId, formId = "", costumeId = ""] = file
      .replace("pokemon_icon_", "")
      .replace("_shiny", "")
      .replace(".png", "")
      .split("_")

    // check for shiny and gender image variants
    const tag = {
      shiny: file.includes("_shiny") ? "s" : "",
      female: formId === "01" ? "f" : ""
    }


    // baseId should be 4 digits
    baseId = baseId.padStart(4, 0)
    // clear form ID for base & gender variant forms (00: base/male, 01: female)
    formId = ["00", "01"].includes(formId) ? "" : formId

    const pokemonId = `${baseId}${formId}`

    // update pokemon image flags
    if (Boolean(tag.shiny))
      pokemonImageFlags[pokemonId] |= pokemonImageFlag.shiny
    if (Boolean(tag.female))
      pokemonImageFlags[pokemonId] |= pokemonImageFlag.gender


    // get image paths for copy/rename
    const srcPath = `${POKEMON_SRCDIR}/${file}`
    const outPath = `${POKEMON_OUTDIR}/${pokemonId}${costumeId}${tag.shiny}${tag.female}.png`

    // queue up async image processing task
    tasks.push(new Promise(resolve => {
      const srcBuffer = fs.createReadStream(srcPath)
      const outBuffer = fs.createReadStream(outPath)

      // update copied image if images are different
      streamEqual(srcBuffer, outBuffer, (err, equal) => {
        if (!equal) {
          fs.createReadStream(srcPath)
            .pipe(fs.createWriteStream(outPath))
            .on("close", resolve)
        }
        else resolve()
      })
    }))
  })

  return Promise.all(tasks)
}