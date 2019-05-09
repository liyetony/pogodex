import { createSelector } from "reselect";
import {
  getStardustCosts,
  getStardustLuckyMultiplier,
  getCPMultipliers
} from "./content";
import { getTeam } from "./settings";
import { getPokemon } from "./pokemon";
import {
  IVT_RANGE,
  MAX_IVT,
  IV_RANGE,
  MAX_IV,
  calcCPMStep,
  calcHP,
  calcCP
} from "../../modules/pokemon";

/**
 * Get appraisal configuration properties.
 * @returns {Object} appraisal configuration properties.
 */
export const getAppraisalProps = createSelector(
  [getPokemon, state => state.pokemon.appraisal],
  (pokemon, props) =>
    props && pokemon.valid ? { ...props } : { cp: "", hp: "", sd: "" }
);

/**
 * Get IV combinations sorter.
 * @returns {Array} [sortKey, sortOrder] tuple
 */
export const getIVComboSorter = state => [
  ...(state.pokemon.appraisalSorter || ["ivt", -1])
];

/**
 * Get unique stardust cost options, which include potential lucky pokemon scalings.
 * @returns {Array} unique stardust cost options
 */
export const getStardustOptions = createSelector(
  [getStardustCosts, getStardustLuckyMultiplier, getAppraisalProps],
  (costs, scalar, config) => [
    ...new Set(!config.lucky ? costs : costs.map(c => scalar * c))
  ]
);

/**
 * Get team leader appraisal on IV totals.
 * @returns {Array} IV total options
 */
export const getIVTOptions = createSelector(
  [getTeam, getPokemon],
  (team, pokemon) => getIVTAppraisals(team, pokemon.name)
);

/**
 * Get team leader appraisal on IVs.
 * @returns {Array} IV options
 */
export const getIVOptions = createSelector(
  [getTeam],
  team => getIVAppraisals(team)
);

/**
 * Get appraisal values from appraisal input.
 * @returns {Object} appraisal values
 */
const getAppraisalValues = createSelector(
  [
    getPokemon,
    getStardustOptions,
    getStardustLuckyMultiplier,
    getAppraisalProps
  ],
  (pokemon, stardustCosts, stardustScalar, config) => {
    const ivtRange = IVT_RANGE[config.ivt] || [0, MAX_IVT],
      ivRange = IV_RANGE[config.iv] || [0, MAX_IV];

    return {
      valid: pokemon.valid,
      stats: pokemon.stats,
      cp: Number(config.cp),
      hp: Number(config.hp),
      sd: Number(stardustCosts[config.sd]),
      scalar: config.lucky ? stardustScalar : 1,
      min: {
        ivt: ivtRange[0],
        att: config.att ? ivRange[0] : 0,
        def: config.def ? ivRange[0] : 0,
        sta: config.sta ? ivRange[0] : 0
      },
      max: {
        ivt: ivtRange[1],
        att: config.att ? ivRange[1] : MAX_IV,
        def: config.def ? ivRange[1] : MAX_IV,
        sta: config.sta ? ivRange[1] : MAX_IV
      }
    };
  }
);

/**
 * Get list of IV combinations from appraisal.
 * @returns {Array} list of IV combinations.
 */
const listIVCombinations = createSelector(
  [getCPMultipliers, getStardustCosts, getAppraisalValues],
  (cpMultipliers, stardustCosts, { min, max, stats, ...config }) => {
    if (!config.valid) return [];

    return cpMultipliers
      .map((cpm, index) => ({ cpm, index }))
      .filter(({ index }) => config.sd === stardustCosts[index] * config.scalar)
      .reduce((list, { cpm, index }) => {
        const lv = index + 1;
        const cpmStep = calcCPMStep(cpm, lv);

        for (let sta = min.sta; sta <= max.sta; sta++) {
          const hp = calcHP(cpm, stats[2], sta);
          const hpStep = calcHP(cpmStep, stats[2], sta);
          let combo =
            config.hp === hp
              ? { lv, cpm }
              : config.hp === hpStep
              ? { lv: lv + 0.5, cpm: cpmStep }
              : null;

          if (combo) {
            for (let att = min.att; att <= max.att; att++) {
              for (let def = min.def; def <= max.def; def++) {
                const cp = calcCP(combo.cpm, stats, [att, def, sta]);
                const ivt = att + def + sta;
                if (config.cp === cp && ivt >= min.ivt && ivt <= max.ivt)
                  list.push({ lv: combo.lv, ivt, att, def, sta });
              }
            }
          }
        }
        return list;
      }, []);
  }
);

/**
 * Get list of sorted IV Combinations.
 * @returns {Array} sorted list of IV combinations.
 */
export const getIVCombinations = createSelector(
  [listIVCombinations, getIVComboSorter],
  (list, [sortKey, sortOrder]) =>
    list.sort((c1, c2) => sortOrder * (c1[sortKey] - c2[sortKey]))
);

/**
 * Get list of IV total appraisal responses from team leader.
 * @param {String} team
 * @param {String} name - pokemon name
 * @returns {Array} team leader IV total responses
 */
function getIVTAppraisals(team, name = "pokemon") {
  switch (team) {
    case 0:
      return [
        `Overall, your ${name} is not likely to make much headway in battle.`,
        `Overall, your ${name} is above average.`,
        `Overall, your ${name} has certainly caught my attention.`,
        `Overall, your ${name} is a wonder! What a breathtaking Pokémon!`
      ];
    case 1:
      return [
        `Overall, your ${name} has room for improvement as far as battling goes.`,
        `Overall, your ${name} is pretty decent!`,
        `Overall, your ${name} is really strong!`,
        `Overall, your ${name} looks like it can really battle with the best of them!`
      ];
    case 2:
      return [
        `Overall, your ${name} may not be great in battle, but I still like it!`,
        `Overall, your ${name} is a decent Pokémon.`,
        `Overall, your ${name} is a strong Pokémon. You should be proud!`,
        `Overall, your ${name} simply amazes me. It can accomplish anything!`
      ];
    default:
      return [];
  }
}

/**
 * Get list of IV appraisal responses from team leader.
 * @param {String} team
 * @returns {Array} team leader IV responses
 */
function getIVAppraisals(team) {
  switch (team) {
    case 0:
      return [
        "Its stats are not out of the norm, in my estimation.",
        "Its stats are noticeably trending to the positive.",
        "I am certainly impressed by its stats, I must say.",
        "Its stats exceed my calculations. It's incredible!"
      ];
    case 1:
      return [
        "Its stats are all right, but kinda basic, as far as I can see.",
        "It's definitely got some good stats. Definitely!",
        "Its stats are really strong! Impressive!",
        "Its stats are the best I've ever seen! No doubt about it!"
      ];
    case 2:
      return [
        "Its stats don't point to greatness in battle.",
        "Its stats indicate that in battle, it'll get the job done.",
        "It's got excellent stats! How exciting!",
        "I'm blown away by its stats. WOW!"
      ];
    default:
      return [];
  }
}
