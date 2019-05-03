import Request from "request"
import csv from "csv-parser"
import fs from "fs-extra"
import { moveBuffFlag, pokemonImageFlag } from "./flags.js"

/**
 * Process gamemaster file and remap keys.
 * Simplifies keys used for identifying game content.
 * @param {Object} context - global context managing all data.
 * @return {Object} Promise - resolves upon completed task.
 */
export function updateKeymap(context = {}) {
  const { paths, keymap, content } = context

  if (!paths || !keymap || !content)
    throw "Invalid context provided"
    
  const gamemaster = fs.readJSONSync(paths.gamemasterSrc)

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
export function buildContent(context = {}) {
  const { paths, strings, keymap, content, extra, pokemonImageFlags } = context
    
  if (!paths || !strings || !keymap || !content || !extra || !pokemonImageFlags)
    throw "Invalid context provided"

  const gamemaster = fs.readJSONSync(paths.gamemasterSrc)
  gamemaster.itemTemplates.forEach(({ templateId, ...template }) => {
    let settingId = Object.keys(template).pop()
    let setting = template[settingId]

    switch(settingId) {
      case "playerLevel": {
        // add list of cp multipliers by level
        content.upgrade.cpMultipliers = setting.cpMultiplier

        // add level range for every encounter, stored as a tuple [min level, max level]
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
        // add list of candy costs by level for pokemon upgrades
        content.upgrade.candyCosts = setting.candyCost
        // add list of stardust costs by level for pokemon upgrades
        content.upgrade.stardustCosts = setting.stardustCost
        break
      }

      case "luckyPokemonSettings": {
        // add stardust cost multipler for lucky pokemon
        content.upgrade.stardustCostLuckyScalar = setting.powerUpStardustDiscountPercent
        break
      }

      case "combatStatStageSettings": {
        // add list of attack multipliers for varying buff stages
        content.combat.attackBuffMultiplier = setting.attackBuffMultiplier
        // add list of defense multipliers for varying buff stages
        content.combat.defenseBuffMultiplier = setting.defenseBuffMultiplier
        break
      }

      case "weatherBonusSettings": {
        // add attack multiplier from weather effects
        content.combat.attackMultiplierFromWeather = setting.attackBonusMultiplier

        // add level and IV bonuses from weather effects
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
        // add list of multipliers against defending types for attacking type
        content.types[id].scalar = setting.attackScalar
        break
      }

      case "moveSettings": {
        const mid = keymap.moves[setting.movementId]
        // add properties for move
        // name: move name
        // type: move type
        // gym: [move power, energy gain or cost] for gym battles and raids
        // time: [move duration, damage start window, damage end window]
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
        // add properties for move
        // name: move name
        // type: move type
        // battle: [move power, energy gain or cost] for trainer battles
        content.moves[mid] = {
          ...content.moves[mid] || {},
          name: strings[`move_name_${mid}`] || "???",
          type: keymap.types[setting.type],
          battle: [setting.power || 0, setting.energyDelta || 0],
        }

        // add potential buffs for trainer battles
        if (setting.buffs) {
          let { buffActivationChance: chance, ...buffs } = setting.buffs
          chance = Math.round(chance * 10) / 10
          buffs = Object.keys(buffs).map(k => [moveBuffFlag[k], buffs[k]])
          // [buff activation chance, bit flags for move buffs]
          content.moves[mid].buffs = [chance, buffs]
        }
        break
      }

      case "formSettings": {
        const baseId = keymap.pokemon[setting.pokemon]
        const name = strings[`pokemon_name_${baseId}`] || "???"
        const desc = strings[`pokemon_desc_${baseId}`] || "???"
        const category = strings[`pokemon_category_${baseId}`] || "???"
        const gen = calcGeneration(content.regions, baseId)
        const baseImg = pokemonImageFlags[baseId]
        
        // add root pokemon name, generation, and image flags
        content.pokemon[baseId] = { name, gen, img: baseImg }
        // add root pokemon category and description
        extra.pokemon[baseId] = { desc, category }
        
        if (setting.forms) {
          // Pokemon with multiple forms extend data from root pokemon, 
          // so root pokemon do not have their own entry.
          // 1st gen pokemon with alolan forms have a redudant NORMAL form with an
          // undefined assetBundleValue. 
          // In this situation, root pokemon should have its own entry and not be extended.
          const shouldExtend = !setting.forms.some(form => !form.assetBundleValue)
          if (shouldExtend)
            content.pokemon[baseId].extend = true

          setting.forms.forEach(form => {
            const { form: formKey, assetBundleValue: formId } = form
            if (formId) {
              const pokemonId = `${baseId}${formId}`
              const name = getFormName(formKey)
              const gen = calcGeneration(content.regions, pokemonId)
  
              // pokemon with NORMAL forms arent mapped to their own images.
              // use base form images
              const formImg = pokemonImageFlags[pokemonId] || baseImg
              
              // add pokemon form name, generation, and image flags
              content.pokemon[pokemonId] = { name, gen, img: formImg }
              // create entry for pokemon form
              extra.pokemon[pokemonId] = {}
            }
          })
        }
        break
      }

      case "genderSettings": {
        const baseId = keymap.pokemon[setting.pokemon]
        const formId = keymap.pokemon[templateId.slice(20)]    // SPAWN_V####_POKEMON_<KEY>
        const pokemonId = formId === baseId ? baseId : `${baseId}${formId || ""}`

        // add gender ratios property to pokemon as a triplet [neutral, male, female]
        extra.pokemon[pokemonId].gender = [
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

        const family = keymap.pokemon[setting.familyId.slice(7)]   // FAMILY_***
        const rarity = keymap.pokemonRarity[setting.rarity]
        const getMoveId = moveKey => keymap.moves[moveKey]
        const fastMoves = (setting.quickMoves || []).map(getMoveId)
        const chargeMoves = (setting.cinematicMoves || []).map(getMoveId)

        // add pokemon properties
        // fam: pokemon family
        // rarity: pokemon rarity
        // types: [first type, optional second type]
        // stats: [base attack, base defense, base stamina],
        // moves: list of both fast moves that gain energy and charge moves that consume energy
        content.pokemon[pokemonId] = {
          ...content.pokemon[pokemonId],
          fam: family,
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

        // add pokemon properties
        // weight: pokemon weight
        // height: pokemon height
        // dist: buddy walking distance
        extra.pokemon[pokemonId] = {
          ...extra.pokemon[pokemonId],
          weight: Math.round(setting.pokedexWeightKg * 10) / 10,
          height: Math.round(setting.pokedexHeightM * 10) / 10,
          dist: setting.kmBuddyDistance,
        }
        break
      }

      case "smeargleMovesSettings": {
        const pokemonId = keymap.pokemon.SMEARGLE
        const getMoveId = moveKey => `${keymap.moves[moveKey]}C`
        const fastMoves = (setting.quickMoves || []).map(getMoveId)
        const chargeMoves = (setting.cinematicMoves || []).map(getMoveId)

        // add moves for Smeargle, all moves are tagged with 'C' for "copy"
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
 * @param {String} formKey - pokemon form
 */
export function getFormName(formKey) {
  const capitalize = s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`
  let key = String(formKey).toLowerCase()

  // rename alolan forms
  if (key.endsWith("_alola"))
    return `Alolan ${capitalize(key.replace("_alola", ""))}`

  return key
    // rename Unown !
    .replace("exclamation_point", "!")
    // rename Unown ?
    .replace("question_mark", "?")
    // break multi words
    .split("_")
    // capitalize every word
    .map(capitalize)
    .join(" ")
}

/**
 * Calculate generation to which pokemon was introduced.
 * @param {Array} regions - list of regions
 * @param {String} pokemonId - pokemon ID
 * @return {Number} generation
 */
export function calcGeneration(regions, pokemonId = "") {
  const baseId = Number(pokemonId.slice(0, 4))
  const formId = String(pokemonId.slice(4) || "")

  // find region by comparing pokedex entry against last pokedex entry for each generation
  const regionIndex = regions.findIndex(region => baseId > 0 && baseId <= region.last)

  // alolan forms from first gen should be marked as gen 7
  // regionIndex is -1 when no region is matched, default to 0 for unknown region
  return formId === "61" ? 7 : Math.max(0, regionIndex)
}

/**
 * Update pokemon moves based on exclusive moves spreadsheet.
 * @param {Object} context - global context managing all data
 */
function patchExclusiveMoves(context) {
  const { paths, keymap, content } = context

  return new Promise(resolve => {
    return Request(paths.exclusiveMovesUrl)
      .pipe(csv())
      .on("data", CELL => {
        // get type of exclusitivity
        // L for Legacy and E for Event
        const tag = CELL.TYPE.charAt(0)
        const moveId = keymap.moves[CELL.MOVE]
        const pokemonId = keymap.pokemon[CELL.POKEMON]

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