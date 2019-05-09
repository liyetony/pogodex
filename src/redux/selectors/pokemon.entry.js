import { createSelector } from "reselect";
import { getTypeList, getMovesDict, getWeatherScalar } from "./content";
import { getWeatherCondition } from "./session";
import { getPokemon } from "./pokemon";
import { moveBuffFlag } from "../../../data/curator/flags";

/**
 * Get pokemon image display properties.
 * @returns {Object} pokemon image display properties.
 */
export const getPokemonImageDisplayProps = state => ({
  shiny: 0,
  gender: 0,
  ...(state.pokemon.display || {})
});

/**
 * Get pokemon move list display properties.
 * @returns {Object} pokemon move list display properties.
 */
export const getPokemonMoveListDisplayProps = state => ({
  battle: 0,
  grid: false,
  ...(state.pokemon.moves || {})
});

/**
 * Get pokemon move list sorter.
 * @returns {Array} [sortKey, sortOrder]
 */
export const getPokemonMoveListSorter = state => [
  ...(state.pokemon.moveSorter || ["name", 1])
];

/**
 * Get pokemon move list.
 * @returns {Array} pokemon move list.
 */
const _getPokemonMoveList = createSelector(
  [getTypeList, getMovesDict, getPokemon],
  (types, movesDict, pokemon) => {
    if (!pokemon.valid) return [];
    let moves = pokemon.moves || [];

    return moves.map(key => {
      const mid = key.slice(0, 4);
      const move = movesDict[mid];
      const weather = types[move.type].weather;

      const tags = [];
      if (key.includes("E")) tags.push("event");
      if (key.includes("L")) tags.push("legacy");
      if (key.includes("C")) tags.push("photocopy");

      return { mid, ...move, tags, weather };
    });
  }
);

/**
 * Select what move details to display for pokemon move list.
 * @returns {Array} pokemon move list.
 */
const _selectPokemonMoveList = createSelector(
  [
    _getPokemonMoveList,
    getPokemonMoveListDisplayProps,
    getWeatherCondition,
    getWeatherScalar
  ],
  (moves, view, weatherCondition, weatherScalar) => {
    return moves.map(move => {
      const { gym, battle, ...entry } = move;
      let [power, energy] = view.battle === 0 ? gym : battle;

      // check if move is boosted by weather condition.
      // update move power accordingly.
      let boosted;
      if (view.battle === 0 && weatherCondition === move.weather) {
        power = Math.round(power * weatherScalar * 10) / 10;
        boosted = true;
      }

      const buffs = describeBuffs(move.buffs || []);
      return { ...entry, power, energy, boosted, buffs };
    });
  }
);

/**
 * Get sorted selected pokemon move list.
 * @returns {Array} sorted pokemon moves
 */
export const getPokemonMoveList = createSelector(
  [_selectPokemonMoveList, getPokemonMoveListSorter],
  (moves, [sortKey, sortOrder]) =>
    moves.sort((m1, m2) => {
      switch (sortKey) {
        case "name":
          return sortOrder * m1.name.localeCompare(m2.name);
        default:
          return (
            sortOrder * (m1[sortKey] - m2[sortKey]) ||
            m1.name.localeCompare(m2.name)
          );
      }
    })
);

/**
 * Get description for list of buffs.
 * @param {Array} list - list of buffs
 * @returns {Array} list of move buff descriptions
 */
function describeBuffs(list) {
  const buffText = {
    [moveBuffFlag.attackerAttackStatStageChange]: "self attack",
    [moveBuffFlag.attackerDefenseStatStageChange]: "self defense",
    [moveBuffFlag.targetAttackStatStageChange]: "target attack",
    [moveBuffFlag.targetDefenseStatStageChange]: "target defense"
  };

  const [chancePct, buffs = []] = list;

  return buffs.map(([flag, delta]) => {
    const chance = `${chancePct * 100}% chance to`;
    const direction = delta > 0 ? "increase" : "decrease";
    const magnitude = Math.abs(delta) > 1 ? "greatly" : "";
    const target = buffText[flag];

    return `${chance} ${magnitude} ${direction} ${target}`;
  });
}
