import { createSelector } from "reselect";
import { getCPMultipliers } from "./content";
import { getPokemon } from "./pokemon";
import {
  IVT_TIERS,
  MAX_IV,
  calcCP,
  calcHP,
  calcCPMStep
} from "../../modules/pokemon";

/**
 * Get CP filter configuration properties.
 * @returns {Object} CP filter properties
 */
export const getCPfilterProps = createSelector(
  [getPokemon, state => state.pokemon.cpFilter],
  (pokemon, props) =>
    props && pokemon.valid
      ? { ...props }
      : { ivt: "", att: "", def: "", sta: "" }
);

/**
 * Get CP filter text for pokemon.
 * @returns {Array} [good cps, bad cps]
 */
export const getCPFilters = createSelector(
  [getCPMultipliers, getPokemon, getCPfilterProps],
  (cpMultipliers, pokemon, config) => {
    const minIVT = IVT_TIERS[config.ivt];

    if (!pokemon.valid || !pokemon.stats || minIVT == null) return ["", ""];

    const minAtt = Number(config.att || 0),
      minDef = Number(config.att || 0),
      minSta = Number(config.att || 0);

    const good = {
      cps: new Set(),
      hps: new Set()
    };
    const bad = {
      cps: new Set(),
      hps: new Set()
    };

    cpMultipliers.forEach((cpm, index) => {
      const lv = index + 1;
      const cpmStep = calcCPMStep(cpm, lv);
      for (let att = minAtt; att <= MAX_IV; att++) {
        for (let def = minDef; def <= MAX_IV; def++) {
          for (let sta = minSta; sta <= MAX_IV; sta++) {
            const ivt = att + def + sta;
            if (ivt >= minIVT) {
              good.cps.add(calcCP(cpm, pokemon.stats, [att, def, sta]));
              good.hps.add(calcHP(cpm, pokemon.stats[2], sta));
            } else {
              bad.cps.add(calcCP(cpm, pokemon.stats, [att, def, sta]));
              bad.hps.add(calcHP(cpm, pokemon.stats[2], sta));
              if (lv < 40) {
                bad.cps.add(calcCP(cpmStep, pokemon.stats, [att, def, sta]));
                bad.hps.add(calcHP(cpmStep, pokemon.stats[2], sta));
              }
            }
          }
        }
      }
    });

    bad.cps = new Set([...bad.cps].filter(cp => !good.cps.has(cp)));
    bad.hps = new Set([...bad.hps].filter(hp => !good.hps.has(hp)));

    function buildString(sets) {
      const { cps, hps } = sets;
      const pokemonPart = `${Number(pokemon.pid.slice(0, 4))}`;
      const cpPart =
        "&" +
        calcRange(cps)
          .map(range => `cp${range}`)
          .join(",");
      const hpPart =
        "&" +
        calcRange(hps)
          .map(range => `hp${range}`)
          .join(",");

      let str = pokemonPart;
      str += cpPart.length > 1 ? cpPart : "";
      str += hpPart.length > 1 ? hpPart : "";

      return cpPart.length > 1 && hpPart.length > 1 ? str : "";
    }

    return [buildString(good), buildString(bad)];
  }
);

/**
 * Generate list of subranges from an ascending sequence.
 * For example, [1, 2, 3, 5, 7, 9, 10] would yield [1-3, 5, 7, 9-10].
 * @param {Array} sequence - list of ascending numbers
 * @returns {Array} list of subranges
 */
function calcRange(sequence) {
  const seq = [...sequence].sort((v1, v2) => v1 - v2);
  const range = [];

  for (var i = 0; i < seq.length; i++) {
    let start = seq[i];
    let end = start;

    while (seq[i + 1] - seq[i] == 1) {
      end = seq[i + 1];
      i++;
    }
    range.push(start === end ? `${start}` : `${start}-${end}`);
  }
  return range;
}
