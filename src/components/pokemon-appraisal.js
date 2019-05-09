import { connect } from "pwa-helpers/connect-mixin";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import pokemon from "../redux/reducers/pokemon";
import { getPokemon } from "../redux/selectors/pokemon";
import { getTeam } from "../redux/selectors/settings";
import {
  getStardustOptions,
  getIVTOptions,
  getIVOptions,
  getAppraisalProps,
  getIVCombinations,
  getIVComboSorter
} from "../redux/selectors/pokemon.appraisal";
import { getPercent } from "../modules/helper";
import { TEAMS } from "../modules/settings";
import { ROUTE } from "../modules/session";
import { MAX_IVT } from "../modules/pokemon";
import { setTeam } from "../redux/actions/settings";
import {
  configAppraisal,
  sortAppraisalIVCombos
} from "../redux/actions/pokemon";
import { lazyloadsImages } from "./@lazyload-images-mixin";
import { fontStyles } from "./@styles";
import "./pokemon-selector";
import "./+textfield";
import "./+select";
import "./+checkbox";
import "./+button";
import "./+radio";
import "./+order";

store.addReducers({ pokemon });

class PokemonAppraisal extends connect(store)(lazyloadsImages(LitElement)) {
  static get properties() {
    return {
      pokemon: { type: Object },
      team: { type: Number },
      stardustOptions: { type: Array },
      ivtOptions: { type: Array },
      ivOptions: { type: Array },
      config: { type: Object },
      comboSorter: { type: Array },
      combos: { type: Array }
    };
  }

  stateChanged(state) {
    this.pokemon = getPokemon(state);
    this.team = getTeam(state);
    this.stardustOptions = getStardustOptions(state);
    this.ivtOptions = getIVTOptions(state);
    this.ivOptions = getIVOptions(state);
    this.config = getAppraisalProps(state);
    this.comboSorter = getIVComboSorter(state);
    this.combos = getIVCombinations(state);
  }

  updated() {
    this.lazyLoadImages();
  }

  render() {
    const { team, pokemon, config, combos } = this;
    const { stardustOptions, ivtOptions, ivOptions } = this;
    const [sortKey, sortOrder] = this.comboSorter;

    const updateConfig = (props, debounce = false) => {
      store.dispatch(configAppraisal({ ...config, ...props }, debounce));
    };

    const getOrder = key => (key === sortKey ? sortOrder : 0);

    const sort = key => e =>
      store.dispatch(sortAppraisalIVCombos([key, e.detail]));

    const teamTemplate = (name, index) => html`
      <z-button
        class="team"
        toggle
        .label="${name}"
        ?active="${index === team}"
        @change="${e => store.dispatch(setTeam(index))}"
      >
        <img
          class="team-lead"
          loading="lazy"
          alt="team ${name}"
          data-src="${ROUTE.IMAGES.TEAM}/${name}.png"
        />
      </z-button>
    `;

    const appraisalTemplate = key => (text, index) => html`
      <z-radio
        class="reply"
        label="${text}"
        ?checked="${index === config[key]}"
        ?disabled="${!pokemon.valid}"
        @change="${e => updateConfig({ [key]: index })}"
      >
      </z-radio>
    `;

    const comboTemplate = combo => html`
      <div class="combo">
        <span>${getPercent(combo.ivt, MAX_IVT)}%</span>
        <span>${combo.att}</span>
        <span>${combo.def}</span>
        <span>${combo.sta}</span>
        <span>${combo.lv.toFixed(1)}</span>
      </div>
    `;

    return html`
      <pokemon-selector .name="${pokemon.name}"></pokemon-selector>

      <h1 class="fh5">Appraise</h1>
      <section class="teams">${TEAMS.map(teamTemplate)}</section>

      <section class="pokemon">
        <h2 class="ft">Pokemon</h2>
        <z-textfield
          required
          label="CP"
          type="number"
          min="10"
          ?disabled="${!pokemon.valid}"
          .value="${config.cp}"
          @change="${e => updateConfig({ cp: e.detail })}"
        ></z-textfield>
        <z-textfield
          required
          label="HP"
          type="number"
          min="10"
          ?disabled="${!pokemon.valid}"
          .value="${config.hp}"
          @change="${e => updateConfig({ hp: e.detail })}"
        ></z-textfield>
        <z-checkbox
          class="lucky"
          label="Lucky Pokemon"
          ?disabled="${!pokemon.valid}"
          .value="${config.lucky}"
          @change="${e => updateConfig({ lucky: e.detail })}"
        >
        </z-checkbox>
        <z-select
          required
          label="Stardust Cost"
          ?disabled="${!pokemon.valid}"
          .options="${stardustOptions}"
          .value="${config.sd}"
          @change="${e => updateConfig({ sd: e.detail })}"
        ></z-select>
      </section>

      <div class="appraisal">
        <section class="overall replies">
          <h2 class="ft">Overall</h2>
          ${ivtOptions.map(appraisalTemplate("ivt"))}
        </section>

        <section class="attributes replies">
          <h2 class="ft">Best attributes</h2>
          <div class="attribute-select reply">
            <z-checkbox
              label="Attack"
              ?checked="${config.att}"
              ?disabled="${!pokemon.valid}"
              @change="${e => updateConfig({ att: e.detail })}"
            ></z-checkbox>
            <z-checkbox
              label="Defense"
              ?checked="${config.def}"
              ?disabled="${!pokemon.valid}"
              @change="${e => updateConfig({ def: e.detail })}"
            ></z-checkbox>
            <z-checkbox
              label="Health"
              ?checked="${config.sta}"
              ?disabled="${!pokemon.valid}"
              @change="${e => updateConfig({ sta: e.detail })}"
            ></z-checkbox>
          </div>
          ${ivOptions.map(appraisalTemplate("iv"))}
        </section>
      </div>

      <h1 class="fh5"><abbr title="Individual Value">IV</abbr> Combinations</h1>
      <section class="combos">
        <header class="combo">
          <z-order
            label="%"
            ?disabled="${!combos.length}"
            .order="${getOrder("ivt")}"
            @change="${sort("ivt")}"
          ></z-order>
          <z-order
            label="Attack"
            ?disabled="${!combos.length}"
            .order="${getOrder("att")}"
            @change="${sort("att")}"
          ></z-order>
          <z-order
            label="Defense"
            ?disabled="${!combos.length}"
            .order="${getOrder("def")}"
            @change="${sort("def")}"
          ></z-order>
          <z-order
            label="Stamina"
            ?disabled="${!combos.length}"
            .order="${getOrder("sta")}"
            @change="${sort("sta")}"
          ></z-order>
          <z-order
            label="Level"
            ?disabled="${!combos.length}"
            .order="${getOrder("lv")}"
            @change="${sort("lv")}"
          ></z-order>
        </header>
        <p class="empty fbd1" ?hidden="${combos.length}">
          No matching <abbr title="Individual Value">IV</abbr> combinations
          avaiable.
        </p>
        ${combos.map(comboTemplate)}
      </section>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          margin-bottom: var(--bottom);
          color: var(--fgh);
        }

        abbr {
          text-decoration: underline var(--fgd);
        }

        h1 {
          margin: 16px;
          margin-top: 32px;
        }

        h2 {
          margin: 16px;
          color: var(--fgl);
        }

        pokemon-selector {
          position: sticky;
          top: 16px;
          z-index: 1;
        }

        .teams {
          margin: 0 16px;
          display: grid;
          grid-template: auto / repeat(3, 64px);
          grid-gap: 16px;
        }

        .team {
          width: 64px;
          height: 64px;
          border: 2px solid transparent;
          border-radius: 50%;
          box-sizing: border-box;
        }

        .team-lead {
          flex: 0 0 auto;
          width: 48px;
          height: 48px;
        }

        .team[active] {
          border-color: var(--fgp);
        }

        .pokemon {
          margin: 16px;
          display: grid;
          grid-template: auto auto / 1fr 1fr;
          grid-gap: 8px 16px;
          align-items: start;
        }

        .pokemon > h2 {
          grid-column: 1 / -1;
          margin: 0;
        }

        .lucky {
          position: relative;
          left: -8px;
          margin-top: 8px;
        }

        .appraisal {
          margin: 16px 0;
          display: grid;
          grid-gap: 16px;
        }

        .reply {
          margin: 12px 16px 12px 6px;
        }

        .attribute-select {
          display: flex;
        }

        .attribute-select > * {
          margin-right: 8px;
        }

        .combos {
          padding-bottom: 64px;
          margin: 0 16px;
        }

        .combo {
          display: grid;
          align-items: center;
          grid-template-columns: 56px repeat(auto-fit, minmax(40px, 1fr));
          grid-template-rows: 48px;
          color: var(--fg1-color);
          border-left: 1px solid var(--bgb);
          border-right: 1px solid var(--bgb);
          border-bottom: 1px solid var(--bgb);
        }

        .combo:not(header) {
          justify-items: center;
        }

        header.combo {
          position: sticky;
          top: 0px;
          grid-template-rows: 56px;
          border-top: 1px solid var(--bgb);
          background: var(--bg1-color);
        }

        .empty {
          padding: 64px 16px;
          margin: 0;
          text-align: center;
          border: 1px solid var(--bgb);
        }

        @media (min-width: 640px) {
          .pokemon {
            grid-template: auto / 1fr 1fr auto 1fr;
          }
        }

        @media (min-width: 672px) {
          .appraisal {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (any-hover: hover) {
          .combo:not(header):hover {
            background: var(--focus-color);
          }
        }
      `
    ];
  }
}

window.customElements.define("pokemon-appraisal", PokemonAppraisal);
