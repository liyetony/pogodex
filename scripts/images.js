/**
 * Pokemon Images module.
 * @module ./scripts/content
 */

const FS = require("FS-extra")
const POKEMON_SRCDIR = "./assets/pokemon_icons"
const POKEMON_OUTDIR = "./images/pokemon"

/**
 * Parse pokemon images.
 * Copy pokemon images from assets when context.copyPokemonImages = true.
 * @note Update context with keymap before executing.
 * @param {Object} context - global context managing all data
 */
exports.updatePokemon = function(context) {
  const { images, keymap } = context
  const imageTasks = []
  
  if (context.copyPokemonImages) {
    FS.ensureDirSync(POKEMON_OUTDIR)
    FS.emptyDirSync(POKEMON_OUTDIR)
  }

  FS.readdirSync(POKEMON_SRCDIR).forEach(file => {

    // get ids from file name
    let [baseId, formId = "", costumeId = ""] = file
      .replace("pokemon_icon_", "")
      .replace("_shiny", "")
      .replace(".png", "")
      .split("_")


    // check for shiny and gender image variants
    const isShiny = file.includes("_shiny")
    const isFemale = formId === "01"

    // baseId should be 4 digits
    baseId = baseId.padStart(4, 0)
    // clear non-proper formIds (00: base/male, 01: female)
    formId = formId === "00" || isFemale ? "" : formId

    const pokemonId = `${baseId}${formId}`

    // update image flags
    images[pokemonId] |= isShiny ? keymap.pokemonImages.shiny : 0
    images[pokemonId] |= isFemale ? keymap.pokemonImages.gender : 0

    if (context.copyPokemonImages) {
      const shiny = isShiny ? "s" : ""
      const female = isFemale ? "f" : ""
      const fileIn = `${POKEMON_SRCDIR}/${file}`
      const fileOut = `${POKEMON_OUTDIR}/${pokemonId}${costumeId}${shiny}${female}.png`
      imageTasks.push(new Promise(resolve => 
        FS.createReadStream(fileIn)
        .pipe(FS.createWriteStream(fileOut)
        .on("close", resolve))))
    }
  })

  return Promise.all(imageTasks)
}