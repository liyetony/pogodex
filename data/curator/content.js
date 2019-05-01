import Request from "request"
import csv from "csv-parser"
import fs from "fs-extra"
import { moveBuffFlag } from "./flags.js"

const GAMEMASTER_PATH = "./assets/gamemaster/gamemaster.json"
const EXCLUSIVE_MOVES_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq5HHNNYBD8ZJ5M2n-ebscY0j1LmV356tRLmRzAG3oXUr_IRg_hO4dOji6Eu8hZfuzzklh_kO7tDD_/pub?gid=0&single=true&output=csv"

/**
 * Process gamemaster file and remap keys.
 * Simplifies keys used for identifying game content.
 * @param {Object} context - global context managing all data.
 * @return {Object} Promise - resolves upon completed task.
 */
export function updateKeymap(context) {
  const { keymap, content } = context
  const gamemaster = fs.readJSONSync(GAMEMASTER_PATH)

  return new Promise(resolve => {
    gamemaster.itemTemplates.forEach(({ templateId, ...template }) => {
      let settingId = Object.keys(template).pop()
      let setting = template[settingId]

      switch (settingId) {
        case "typeEffective": {
          const key = templateId
          const name = key.toLowerCase().replace("pokemon_type_", "")
          keymap.types[key] = content.types.findIndex(type => type.name === name)
          break
        }

        case "weatherAffinities": {
          const key = setting.weatherCondition
          const name = key.toLowerCase().replace("_", " ")
          keymap.weather[key] = content.weather.findIndex(weather => weather.name === name)
          break
        }

        case "moveSettings": {
          const key = setting.movementId
          keymap.moves[key] = templateId.slice(1, 5)  // V####_MOVE_***
          break
        }

        case "formSettings": {
          // map pokemon to id
          const baseKey = setting.pokemon
          let baseId = templateId.slice(7, 11)   // FORMS_V####_POKEMON_***
          keymap.pokemon[baseKey] = baseId
          
          // map alternative forms to id
          if (setting.forms) {
            setting.forms.forEach(form => {
              const { form: formKey, assetBundleValue: formId } = form
              if (formId)
                keymap.pokemon[formKey] = formId
            })
          }
          break
        }
      }
    })
    resolve()
  })
}

/**
 * Process gamemaster file and reorganize game content.
 * @param {Object} context - global context managing all data.
 * @return {Object} Promise - resolves upon completed task.
 */
export function buildContent(context) {
  const { strings, keymap, content, pokemonContent, pokemonImageFlags } = context
  const gamemaster = fs.readJSONSync(GAMEMASTER_PATH)

  gamemaster.itemTemplates.forEach(({ templateId, ...template }) => {
    let settingId = Object.keys(template).pop()
    let setting = template[settingId]

    switch(settingId) {
      case "playerLevel": {
        content.upgrade.cpMultipliers = setting.cpMultiplier
        content.encounters.forEach(encounter => {
          switch (encounter.name) {
            case "wild":
              return encounter.lvs = [1, setting.maxEncounterPlayerLevel]
            case "hatch":
            case "raid":
              return encounter.lvs = new Array(2).fill(setting.maxEggPlayerLevel)
            case "quest":
              return encounter.lvs = new Array(2).fill(setting.maxQuestEncounterPlayerLevel)
          }
        })
        break
      }

      case "pokemonUpgrades": {
        content.upgrade.candyCosts = setting.candyCost
        content.upgrade.stardustCosts = setting.stardustCost
        break
      }

      case "luckyPokemonSettings": {
        content.upgrade.stardustCostLuckyScalar = setting.powerUpStardustDiscountPercent
        break
      }

      case "combatStatStageSettings": {
        content.combat.attackBuffMultiplier = setting.attackBuffMultiplier
        content.combat.defenseBuffMultiplier = setting.defenseBuffMultiplier
        break
      }

      case "weatherBonusSettings": {
        content.combat.attackMultiplierFromWeather = setting.attackBonusMultiplier
        content.encounters.forEach(encounter => {
          switch (encounter.name) {
            case "wild":
              encounter.weatherLvBonus = setting.cpBaseLevelBonus
              encounter.weatherMinIV = setting.guaranteedIndividualValues
              break
            case "raid":
              encounter.weatherLvBonus = setting.raidEncounterCpBaseLevelBonus
              encounter.weatherMinIV = setting.raidEncounterGuaranteedIndividualValues
              break
          }
        })
        break
      }

      case "weatherAffinities": {
        const boostedTypes = setting.pokemonType.map(key => keymap.types[key])
        const weatherId = keymap.weather[setting.weatherCondition]
        // associate weather to types
        boostedTypes.forEach(id => content.types[id].weather = weatherId)
        // associate types to weather
        content.weather[weatherId].types = boostedTypes
        break
      }

      case "typeEffective": {
        const id = keymap.types[setting.attackType]
        content.types[id].scalar = setting.attackScalar
        break
      }

      case "moveSettings": {
        const mid = keymap.moves[setting.movementId]
        content.moves[mid] = {
          ...content.moves[mid] || {},
          name: strings[`move_name_${mid}`] || "???",
          type: keymap.types[setting.pokemonType],
          gym: [setting.power || 0, setting.energyDelta || 0],
          time: [
            setting.durationMs,
            setting.damageWindowStartMs,
            setting.damageWindowEndMs
          ]
        }
        break
      }

      case "combatMove": {
        const mid = keymap.moves[setting.uniqueId]
        content.moves[mid] = {
          ...content.moves[mid] || {},
          name: strings[`move_name_${mid}`] || "???",
          type: keymap.types[setting.type],
          battle: [setting.power || 0, setting.energyDelta || 0],
        }

        if (setting.buffs) {
          let { buffActivationChance: chance, ...buffs } = setting.buffs
          chance = Math.round(chance * 10) / 10
          buffs = Object.keys(buffs).map(k => [moveBuffFlag[k], buffs[k]])
          content.moves[mid].buffs = [chance, buffs]
        }
        break
      }

      case "formSettings": {
        const baseId = keymap.pokemon[setting.pokemon]
        const name = strings[`pokemon_name_${baseId}`] || "???"
        const desc = strings[`pokemon_desc_${baseId}`] || "???"
        const category = strings[`pokemon_category_${baseId}`] || "???"

        // prioritize pokemon content
        content.pokemon[baseId] = { name }
        pokemonContent[baseId] = { desc, category }

        if (setting.forms) {
          // determine if pokemon with multiple forms should extend base pokemon properties
          content.pokemon[baseId].extend = setting.forms.reduce((extend, form) => {
            const { form: formKey, assetBundleValue: formId } = form
            const pokemonId = `${baseId}${formId || ""}`
            const formName = getFormName(name, formKey)
            content.pokemon[pokemonId] = content.pokemon[pokemonId] || { name: formName }
            pokemonContent[pokemonId] = pokemonContent[pokemonId] || {}

            // non-alolan versions of pokemon have undefined formId,
            // so base form should not be extended
            return extend && Boolean(formId)
          }, true)
        }
        break
      }

      case "genderSettings": {
        const baseId = keymap.pokemon[setting.pokemon]
        const formId = keymap.pokemon[templateId.slice(20)]    // SPAWN_V####_POKEMON_<KEY>
        const pokemonId = formId === baseId ? baseId : `${baseId}${formId || ""}`
        pokemonContent[pokemonId].gender = [
          setting.gender.genderlessPercent || 0,
          setting.gender.malePercent || 0,
          setting.gender.femalePercent || 0
        ]
        break
      }

      case "pokemonSettings": {
        const baseId = keymap.pokemon[setting.pokemonId]
        const formId = keymap.pokemon[setting.form]
        const pokemonId = `${baseId}${formId || ''}`

        const gen = calcGeneration(content.regions, baseId, formId)
        const family = keymap.pokemon[setting.familyId.slice(7)]   // FAMILY_***
        const rarity = keymap.pokemonRarity[setting.rarity]
        const img = pokemonImageFlags[`${baseId}${formId || ""}`]

        const getMoveId = moveKey => keymap.moves[moveKey]
        const fastMoves = (setting.quickMoves || []).map(getMoveId)
        const chargeMoves = (setting.cinematicMoves || []).map(getMoveId)

        // prioritize pokemon content
        content.pokemon[pokemonId] = {
          ...content.pokemon[pokemonId],
          fam: family,
          img,
          gen,
          rarity,
          types: [setting.type, setting.type2]
            .filter(Boolean)
            .map(key => keymap.types[key]),
          stats: [
            setting.stats.baseAttack,
            setting.stats.baseDefense,
            setting.stats.baseStamina,
          ],
          moves: content.pokemon[pokemonId].moves || [...fastMoves, ...chargeMoves],
        }
        pokemonContent[pokemonId] = {
          ...pokemonContent[pokemonId],
          weight: Math.round(setting.pokedexWeightKg * 10) / 10,
          height: Math.round(setting.pokedexHeightM * 10) / 10,
          dist: setting.kmBuddyDistance,
        }
        break
      }

      case "smeargleMovesSettings": {
        const pokemonId = keymap.pokemon.SMEARGLE
        const getMoveId = moveKey => `${keymap.moves[moveKey]}M`
        const fastMoves = (setting.quickMoves || []).map(getMoveId)
        const chargeMoves = (setting.cinematicMoves || []).map(getMoveId)
        content.pokemon[pokemonId].moves = [...fastMoves, ...chargeMoves]
        break
      }

      default: context.ignoredTemplates[settingId] = true
    }
  })

  return patchExclusiveMoves(context)
}


/**
 * Calculate pokemon name for specific form.
 * @param {String} baseName - pokemon name w/o form
 * @param {String} formKey - pokemon form
 */
function getFormName(baseName, formKey) {
  const capitalize = s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

  let key = String(formKey).toLowerCase()

  if (key.endsWith("_alola"))
    return `Alolan ${baseName}`

  return key
    .replace("exclamation_point", "!")
    .replace("question_mark", "?")
    .split("_")
    .map(capitalize)
    .join(" ")
}

/**
 * Calculate generation to which pokemon was introduced.
 * @param {Array} regions - list of regions
 * @param {String} baseId - pokemon base ID
 * @param {String} formId - pokemon form ID
 * @return {Number} generation
 */
function calcGeneration(regions, baseId, formId) {
  baseId = Number(baseId)
  formId = String(formId)

  const regionIndex = regions.findIndex(region => baseId <= region.last)

  return formId === "61" ? 7 : Math.max(0, regionIndex)
}

/**
 * Update pokemon moves based on exclusive moves spreadsheet.
 * @param {Object} context - global context managing all data
 */
function patchExclusiveMoves(context) {
  const { keymap, content } = context
  const mapHeaders = ({ header }) => header.toLowerCase()

  return new Promise(resolve => {
    return Request(EXCLUSIVE_MOVES_URL)
      .pipe(csv({ mapHeaders }))
      .on("data", cell => {
        const moveId = keymap.moves[cell.move]
        const pokemonId = keymap.pokemon[cell.pokemon]

        // get exclusive status tag (L: legacy, E: event)
        const tag = cell.type.charAt(0)

        // check if move exists
        const index = content.pokemon[pokemonId].moves
          .findIndex(key => key.startsWith(moveId))

        // append or update tagged move
        if (index < 0)
          content.pokemon[pokemonId].moves.push(`${moveId}${tag}`)
        else
          content.pokemon[pokemonId].moves[index] += tag
      })
      .on("end", resolve)
  })
}