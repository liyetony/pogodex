/**
 * Pokemon Content module.
 * @module ./scripts/content
 */

const Request = require("request")
const csv = require("csv-parser")
const Gamemaster = require("../assets/gamemaster/gamemaster.json")
const EXCLUSIVE_MOVES_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq5HHNNYBD8ZJ5M2n-ebscY0j1LmV356tRLmRzAG3oXUr_IRg_hO4dOji6Eu8hZfuzzklh_kO7tDD_/pub?gid=0&single=true&output=csv"


/**
 * Map keys used in gamemaster to simplified IDs.
 * @param {Object} context - global context managing all data
 */
exports.createKeymap = function (context) {
  const mapKey = {
    "noop":                 () => null,
    "typeEffective":        mapTypeKey,
    "weatherAffinities":    mapWeatherKey,
    "moveSettings":         mapMoveKey,
    "formSettings":         mapPokemonKey,
  }

  // map keys to id for relevant templates
  Gamemaster.itemTemplates.forEach(({ templateId, ...template }) => {
    let settingId = Object.keys(template).pop()
    let setting = template[settingId]
    return (mapKey[settingId] || mapKey.noop)(context, templateId, setting)
  })
}


/**
 * Generate content via gamemaster file.
 * @note Update context with keymap before executing.
 * @param {Object} context - global context managing all data
 */
exports.buildGamedata = function (context) {
  const parse = {
    "noop":                       () => null,
    "playerLevel":                parsePlayerLevel,
    "pokemonUpgrades":            parsePokemonUpgrades,
    "luckyPokemonSettings":       parseLuckyPokemonSettings,
    "combatStatStageSettings":    parseCombatStatStageSettings,
    "weatherBonusSettings":       parseWeatherBonusSettings,
    "weatherAffinities":          parseWeatherAffinities,
    "typeEffective":              parseTypeEffective,
    "moveSettings":               parseMoveSettings,
    "combatMove":                 parseCombatMove,
    "formSettings":               parseFormSettings,
    "pokemonSettings":            parsePokemonSettings,
    "genderSettings":             parseGenderSettings,
  }

  // parse relevant templates
  Gamemaster.itemTemplates.forEach(({ templateId, ...template }) => {
    let settingId = Object.keys(template).pop()
    let setting = template[settingId]
    return (parse[settingId] || parse.noop)(context, templateId, setting)
  })

  return patchExclusiveMoves(context)
}


/**
 * Update pokemon moves based on exclusive moves spreadsheet.
 * @param {Object} context - global context managing all data
 */
function patchExclusiveMoves (context) {
  const { keymap, main } = context
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
        const index = main.pokemon[pokemonId].moves
          .findIndex(key => key.startsWith(moveId))

        // append/update tagged move
        if (index < 0)
          main.pokemon[pokemonId].moves.push(`${moveId}${tag}`)
        else
          main.pokemon[pokemonId].moves[index] += tag
      })
      .on("end", resolve)
  })
}


/**
 * Update keymap for pokemon type.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon type template data
 */
function mapTypeKey (context, templateId, setting) {
  let { keymap, main } = context
  const typeKey = templateId
  let name = typeKey.toLocaleLowerCase().replace("pokemon_type_", "")
  let typeId = main.types.findIndex(type => type.name === name)
  keymap.types[typeKey] = typeId
}


/**
 * Update keymap for weather.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - weather template data
 */
function mapWeatherKey (context, templateId, setting) {
  let { keymap, main } = context
  const weatherKey = setting.weatherCondition
  let name = weatherKey.toLocaleLowerCase().replace('_', ' ')
  let weatherId = main.weather.findIndex(wc => wc.name === name)
  keymap.weather[weatherKey] = weatherId
}


/**
 * Update keymap for pokemon move.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon move template data
 */
function mapMoveKey (context, templateId, setting) {
  let { keymap } = context
  let moveKey = setting.movementId
  let moveId = templateId.slice(1, 5)   // V####_MOVE_***
  keymap.moves[moveKey] = moveId
}


/**
 * Update keymap for pokemon.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon template data
 */
function mapPokemonKey (context, templateId, setting) {
  let { keymap } = context

  // map base pokemon key to id
  let baseKey = setting.pokemon
  let baseId = templateId.slice(7, 11)   // FORMS_V####_POKEMON_***
  keymap.pokemon[baseKey] = baseId

  // map potential pokemon form keys to ids
  if (setting.forms) {
    setting.forms.forEach(form => {
      const { form: formKey, assetBundleValue: formId } = form
      if (formId)
        keymap.pokemon[formKey] = formId
    })
  }
}


/**
 * Parse player level related settings. (cp multipliers, encounters)
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - level template data
 */
function parsePlayerLevel (context, templateId, setting) {
  let { main } = context
  main.upgrade = {
    ...main.upgrade,
    cpMultipliers: setting.cpMultiplier,
  }
  main.encounters.forEach(encounter => {
    switch (encounter.type) {
      case "wild":
        return encounter.lvs = [1, setting.maxEncounterPlayerLevel]
      case "hatch":
      case "raid":
        return encounter.lvs = new Array(2).fill(setting.maxEggPlayerLevel)
      case "quest":
        return encounter.lvs = new Array(2).fill(setting.maxQuestEncounterPlayerLevel)
    }
  })
}


/**
 * Parse pokemon level related settings. (candy costs, stardust costs)
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - level template data
 */
function parsePokemonUpgrades (context, templateId, setting) {
  let { main } = context
  main.upgrade = {
    ...main.upgrade,
    candyCosts: setting.candyCost,
    stardustCosts: setting.stardustCost,
  }
}


/**
 * Parse stardust cost lucky multiplier setting.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - lucky stardust multiplier
 */
function parseLuckyPokemonSettings (context, templateId, setting) {
  let { main } = context
  main.upgrade = {
    ...main.upgrade,
    stardustCostLuckyScalar: setting.powerUpStardustDiscountPercent,
  }
}


/**
 * Parse combat stat multipliers.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - combat stat multipliers
 */
function parseCombatStatStageSettings (context, templateId, setting) {
  let { main } = context
  main.combat = {
    ...main.combat,
    attackBuffMultiplier: setting.attackBuffMultiplier,
    defenseBuffMultiplier: setting.defenseBuffMultiplier,
  }
}


/**
 * Parse weather settings.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - weather settings
 */
function parseWeatherBonusSettings (context, templateId, setting) {
  let { main } = context
  main.combat = {
    ...main.combat,
    attackMultiplierFromWeather: setting.attackBonusMultiplier,
  }

  main.encounters.forEach(encounter => {
    switch (encounter.type) {
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
}


/**
 * Parse pokemon type weather affinities.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - weather affinities
 */
function parseWeatherAffinities (context, templateId, setting) {
  let { keymap, main } = context
  const boostedTypes = setting.pokemonType.map(key => keymap.types[key])
  const weatherId = keymap.weather[setting.weatherCondition]

  // associate weather to types
  boostedTypes.forEach(id => main.types[id].weather = weatherId)

  // associate types to weather
  main.weather[weatherId].types = boostedTypes
}


/**
 * Parse pokemon type chart multipliers.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon type scalars
 */
function parseTypeEffective (context, templateId, setting) {
  const { keymap, main } = context
  let id = keymap.types[setting.attackType]
  main.types[id].scalar = setting.attackScalar  // effective type multipliers for attacker
}


/**
 * Parse move settings.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - move settings
 */
function parseMoveSettings (context, templateId, setting) {
  const { strings, keymap, main } = context
  const mid = keymap.moves[setting.movementId]
  main.moves[mid] = {
    ...main.moves[mid] || {},
    name: strings[`move_name_${mid}`] || "???",
    type: keymap.types[setting.pokemonType],
    gym: [setting.power || 0, setting.energyDelta || 0],
    time: [
      setting.durationMs,
      setting.damageWindowStartMs,
      setting.damageWindowEndMs
    ]
  }
}


/**
 * Parse trainer battle move settings.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - trainer battle move settings
 */
function parseCombatMove (context, templateId, setting) {
  const { strings, keymap, main } = context
  const mid = keymap.moves[setting.uniqueId]

  main.moves[mid] = {
    ...main.moves[mid] || {},
    name: strings[`move_name_${mid}`] || "???",
    type: keymap.types[setting.type],
    battle: [setting.power || 0, setting.energyDelta || 0],
  }

  if (setting.buffs) {
    let { buffActivationChance: chance, ...buffs } = setting.buffs

    chance = Math.round(chance * 10) / 10
    buffs = Object.keys(buffs).map(k => [keymap.moveBuffs[k], buffs[k]])
    main.moves[mid].buffs = [chance, buffs]
  }
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
 * Parse pokemon forms.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon forms
 * @returns {String} pokemon form
 */
function parseFormSettings (context, templateId, setting) {
  const { strings, keymap, main, pokemonContent } = context
  const baseId = keymap.pokemon[setting.pokemon]
  const name = strings[`pokemon_name_${baseId}`] || "???"
  const desc = strings[`pokemon_desc_${baseId}`] || "???"
  const category = strings[`pokemon_category_${baseId}`] || "???"

  /* prioritize pokemon content (main: critical) */
  main.pokemon[baseId] = { name }
  pokemonContent[baseId] = { desc, category }


  if (setting.forms) {
    // pokemon has multiple forms, base form should be extended
    main.pokemon[baseId].base = 1;

    setting.forms.forEach(form => {
      const { form: formKey, assetBundleValue: formId } = form
      const pokemonId = `${baseId}${formId || ""}`
      const formName = getFormName(name, formKey)
      main.pokemon[pokemonId] = main.pokemon[pokemonId] || { name: formName }
      pokemonContent[pokemonId] = pokemonContent[pokemonId] || {}

      // non-alolan versions of pokemon have undefined formId,
      // so base form should not be extended
      if (formId === undefined) delete main.pokemon[baseId].base
    })
  }
}


/**
 * Parse pokemon gender info.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon gender info
 */
function parseGenderSettings (context, templateId, setting) {
  const { keymap, pokemonContent } = context
  const baseId = keymap.pokemon[setting.pokemon]
  const formId = keymap.pokemon[templateId.slice(20)]    // SPAWN_V####_POKEMON_***

  const pokemonId = formId === baseId ? baseId : `${baseId}${formId || ""}`
  pokemonContent[pokemonId].gender = [
    setting.gender.genderlessPercent || 0,
    setting.gender.malePercent || 0,
    setting.gender.femalePercent || 0
  ]
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
 * Parse pokemon info.
 * @param {Object} context - global context managing all data
 * @param {String} templateId - template ID
 * @param {Object} setting - pokemon info
 */
function parsePokemonSettings (context, templateId, setting) {
  const { keymap, images, main, pokemonContent } = context
  const baseId = keymap.pokemon[setting.pokemonId]
  const formId = keymap.pokemon[setting.form]
  const pokemonId = `${baseId}${formId || ''}`

  const gen = calcGeneration(main.regions, baseId, formId)
  const family = keymap.pokemon[setting.familyId.slice(7)]   // FAMILY_***
  const rarity = keymap.pokemonRarity[setting.rarity]
  const img = images[`${baseId}${formId || ""}`]

  const getMoveId = moveKey => keymap.moves[moveKey]
  const fastMoves = (setting.quickMoves || []).map(getMoveId)
  const chargeMoves = (setting.cinematicMoves || []).map(getMoveId)

  /* prioritize pokemon content (main: critical) */
  
  main.pokemon[pokemonId] = {
    ...main.pokemon[pokemonId],
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
    moves: [...fastMoves, ...chargeMoves],
  }

  pokemonContent[pokemonId] = {
    ...pokemonContent[pokemonId],
    weight: Math.round(setting.pokedexWeightKg * 10) / 10,
    height: Math.round(setting.pokedexHeightM * 10) / 10,
    dist: setting.kmBuddyDistance,
  }
}
