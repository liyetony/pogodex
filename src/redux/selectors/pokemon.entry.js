import { createSelector } from "reselect"
import { getTypeList, getMovesDict, getWeatherScalar } from "./content"
import { getWeatherCondition } from "./session"
import { getPokemon } from "./pokemon"
import { moveBuffFlag } from "../../../data/curator/flags"


/**
 * Get pokemon image display properties.
 * @param {State} state
 * @returns {Object} display properties
 */
export const getDisplayProps = state => ({
  shiny: 0, gender: 0,
  ...state.pokemon.display || {}
})


/**
 * Get move list perspective, determining what move data to present.
 * @param {State} state
 * @returns {String} move list perspective
 */
export const getPokemonMovesPerspective = state => state.pokemon.movesPerspective || 0


/**
 * Get pokemon moves sorter.
 * @param {State} state
 * @returns {Array} [sortKey, sortOrder] tuple
 */
export const getPokemonMovesSorter = state => [...state.pokemon.movesSorter || ["name", 1]]


/**
 * Get list of pokemon moves.
 * @param {State} state
 * @returns {Array} pokemon moves
 */
const listPokemonMoves = createSelector(
  [getTypeList, getMovesDict, getPokemon],
  (types, movesDict, pokemon) => {
    if (!pokemon.valid)
      return []
    let moves = pokemon.moves || []

    return moves.map(key => {
      const mid = key.slice(0, 4)
      const move = movesDict[mid]
      const weather = types[move.type].weather

      const tags = []
      if (key.includes("E")) tags.push("event")
      if (key.includes("L")) tags.push("legacy")

      return { mid, ...move, tags, weather }
    })
  }
)


/**
 * Get list of pokemon moves after applying weather conditions and move perspective.
 * @param {State} state
 * @returns {Array} modified pokemon moves
 */
const listPokemonMovesConfigured = createSelector(
  [
    listPokemonMoves, getPokemonMovesPerspective,
    getWeatherCondition, getWeatherScalar
  ],
  (moves, view, weather, scalar) => moves
    .map(move => {
      const { gym, battle, ...entry } = move
      let [power, energy] = view === 0 ? gym : battle
      let boosted

      if (view === 0 && weather === move.weather) {
        power = Math.round(power * scalar * 10) / 10;
        boosted = true;
      }

      let buffs = describeBuffs(move.buffs || [])

      return { ...entry, power, energy, boosted, buffs }
    })
)


/**
 * Get sorted list of pokemon moves.
 * @param {State} state
 * @returns {Array} sorted pokemon moves
 */
export const getPokemonMoves = createSelector(
  [listPokemonMovesConfigured, getPokemonMovesSorter],
  (moves, [sortKey, sortOrder]) => moves
    .sort((m1, m2) => {
      switch (sortKey) {
        case "name":
          return sortOrder * m1.name.localeCompare(m2.name);
        default:
          return sortOrder * (m1[sortKey] - m2[sortKey]) ||
            m1.name.localeCompare(m2.name);
      }
    })
)


/**
 * Get description for list of buffs.
 * @param {Array} list - list of buffs
 * @returns {String} move buffs description
 */
function describeBuffs(list) {
  const [chance, buffs = []] = list
  const buffText = {
    [moveBuffFlag.attackerAttackStatStageChange]: "User attack",
    [moveBuffFlag.attackerDefenseStatStageChange]: "User defense",
    [moveBuffFlag.targetAttackStatStageChange]: "Opponent attack",
    [moveBuffFlag.targetDefenseStatStageChange]: "Opponent defense",
  }
  return buffs.reduce((text, [flag, value]) => {
    const direction = value > 0 ? "up" : "down"
    const buff = buffText[flag]

    return !buff ? text : `${text} ${buff} ${direction},`
  }, "").slice(0, -1)
}
