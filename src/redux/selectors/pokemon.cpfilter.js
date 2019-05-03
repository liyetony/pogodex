import { createSelector } from "reselect"
import { getCPMultipliers, getWildEncounter } from "./content";
import { getPokemon } from "./pokemon";
import { IVT_TIERS, MAX_IV, calcCP, calcHP } from "../../modules/pokemon";


/**
 * Get CP filter configuration properties.
 * @param {State} state
 * @returns {Object} CP filter properties
 */
export const getCPfilterProps = state => ({
  ivt: "", att: "", def: "", sta: "",
  ...state.pokemon.cpFilter || {}
})


/**
 * Get CP filter text for pokemon.
 * @param {State} state
 * @returns {String} pokemon CP filter text
 */
export const getCPFilterText = createSelector(
  [getCPMultipliers, getWildEncounter, getPokemon, getCPfilterProps],
  (cpMultipliers, encounter, pokemon, config) => {
    const minIVT = IVT_TIERS[config.ivt]


    if (!pokemon.valid || !pokemon.stats || minIVT == null)
      return ""

    const minAtt = Number(config.att || 0),
          minDef = Number(config.att || 0),
          minSta = Number(config.att || 0),
          [minLv, maxLv] = encounter.lvs

    let cps = new Set(),
        hps = new Set()

    cpMultipliers
      .slice(minLv - 1, maxLv + encounter.weatherLvBonus)
      .forEach(cpm => {
        for (let att = minAtt; att <= MAX_IV; att++) {
          for (let def = minDef; def <= MAX_IV; def++) {
            for (let sta = minSta; sta <= MAX_IV; sta++) {
              const ivt = att + def + sta
              if (ivt >= minIVT) {
                cps.add(calcCP(cpm, pokemon.stats, [att, def, sta]))
                hps.add(calcHP(cpm, pokemon.stats[2], sta))
              }
            }
          }
        }
      })

    const pokemonPart = `${Number(pokemon.pid.slice(0, 4))}`
    const cpPart = calcRange(cps).map(range => `cp${range}`).join(",")
    const hpPart = calcRange(hps).map(range => `hp${range}`).join(",")

    return `${pokemonPart}&${cpPart}&${hpPart}`
  }
)


/**
 * Generate list of subranges from an ascending sequence.
 * For example, [1, 2, 3, 5, 7, 9, 10] would yield [1-3, 5, 7, 9-10].
 * @param {Array} sequence - list of ascending numbers
 * @returns {Array} list of subranges
 */
function calcRange(sequence) {
  const seq = [...sequence].sort((v1, v2) => v1 - v2)
  const range = []

  for (var i = 0; i < seq.length; i++) {
    let start = seq[i]
    let end = start

    while (seq[i + 1] - seq[i] == 1) {
      end = seq[i + 1]
      i++
    }
    range.push(start === end ? `${start}` : `${start}-${end}`)
  }
  return range
}