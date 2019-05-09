/**
 * Pokemon battle types.
 * @constant
 * @readonly
 * @type {Array}
 */
export const BATTLE_TYPES = ["gym & raids", "trainer battles"];

/**
 * IV Total breakpoints. (decrements of 10%)
 * @constant
 * @readonly
 * @type {Array}
 */
export const IVT_TIERS = [45, 41, 36, 32, 27, 23, 18, 13, 9, 5, 0];

/**
 * IV Total min & max ranges. (Appraisal)
 * @constant
 * @readonly
 * @type {Array}
 */
export const IVT_RANGE = [[0, 22], [23, 29], [30, 36], [37, 45]];

/**
 * Max IV total
 * @constant
 * @readonly
 * @type {Number}
 */
export const MAX_IVT = 45;

/**
 * IV min & max ranges. (Appraisal)
 * @constant
 * @readonly
 * @type {Array}
 */
export const IV_RANGE = [[0, 7], [8, 12], [13, 14], [15, 15]];

/**
 * Max IV value
 * @constant
 * @readonly
 * @type {Number}
 */
export const MAX_IV = 15;

/**
 * CPM steps
 * @see https://pokemongo.gamepress.gg/cp-multiplier
 * @constant
 * @readonly
 * @type {Array}
 */
export const CPM_STEPS = [
  0.009426125469,
  0.008919025675,
  0.008924905903,
  0.00445946079
];

/**
 * Calculate pokemon health points (HP).
 * @param {Number} cpm - cp multiplier
 * @param {Number} baseSta - pokemon base stamina
 * @param {Number} ivSta - stamina IV
 * @returns {Number} health points (HP)
 */
export function calcHP(cpm, baseSta, ivSta) {
  let hp = Math.floor(cpm * (baseSta + ivSta));
  return Math.max(10, hp);
}

/**
 * Calculate pokemon combat power (CP).
 * @param {Number} cpm - cp multiplier
 * @param {Array} stats - pokemon base stats
 * @param {Array} ivs - pokemon stat ivs
 * @returns {Number} combat power (CP)
 */
export function calcCP(cpm, stats, ivs) {
  let [atk, def, sta] = stats.map((base, index) => (base + ivs[index]) * cpm);
  let cp = Math.floor(0.1 * atk * Math.sqrt(def) * Math.sqrt(sta));
  return Math.max(10, cp);
}

/**
 * Calculate combat power at half-step.
 * @param {Number} cpm - cp multiplier
 * @param {Number} lv - pokemon level
 * @returns {Number} combat power (CP) at half step
 */
export function calcCPMStep(cpm, lv) {
  const step = CPM_STEPS[Math.floor(lv / 10)];
  return Math.sqrt(Math.pow(cpm, 2) + step);
}
