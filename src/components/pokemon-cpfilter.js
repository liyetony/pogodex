import { connect } from "pwa-helpers/connect-mixin";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import pokemon from "../redux/reducers/pokemon";
import { IVT_TIERS, MAX_IVT, MAX_IV } from "../modules/pokemon";
import { getPercent } from "../modules/helper";
import {
  getCPfilterProps,
  getCPFilters
} from "../redux/selectors/pokemon.cpfilter";
import { getPokemon } from "../redux/selectors/pokemon";
import { configCPFilter } from "../redux/actions/pokemon";
import { showSnackbar } from "../redux/actions/session";
import "./pokemon-selector";
import { fontStyles } from "./@styles";
import "./+select";
import "./+textfield";
import "./+button";

store.addReducers({ pokemon });

const IVT_PCT_TIERS = IVT_TIERS.map(ivt => `${getPercent(ivt, MAX_IVT)}%`);

class PokemonCPFilter extends connect(store)(LitElement) {
  static get properties() {
    return {
      pokemon: { type: Object },
      config: { type: Object },
      filters: { type: Array }
    };
  }

  stateChanged(state) {
    this.pokemon = getPokemon(state);
    this.config = getCPfilterProps(state);
    this.filters = getCPFilters(state);
  }

  render() {
    const { pokemon, config } = this;
    const [passFilter, failFilter] = this.filters;

    const copyFilterText = id => e => {
      const $textarea = this.renderRoot.querySelector(`#${id}`);
      $textarea.select();
      document.execCommand("copy");
      store.dispatch(
        showSnackbar(`Copied ${id} CP filter for ${pokemon.name}.`)
      );
    };

    const updateFilter = props =>
      store.dispatch(configCPFilter({ ...config, ...props }));

    return html`
      <pokemon-selector .name="${pokemon.name}"></pokemon-selector>
      <h1 class="fh5">Configure Filter</h1>
      <p>
        Specify minimum <abbr title="Individual Values">IV</abbr>s for
        ${pokemon.name || "a pokemon"} to create a search string of
        <abbr title="Combat Power">CP</abbr> and
        <abbr title="Health Points">HP</abbr> combinations.
      </p>

      <section class="config">
        <z-select
          class="ivt"
          required
          label="Min IV Total"
          .disabled="${!pokemon.valid}"
          .options="${IVT_PCT_TIERS}"
          .value="${config.ivt}"
          @change="${e => updateFilter({ ivt: e.detail })}"
        >
        </z-select>
        <z-textfield
          class="iv"
          type="number"
          min="0"
          .max=${MAX_IV}
          label="Attack IV"
          .disabled="${!pokemon.valid}"
          .value="${config.att}"
          @change="${e => updateFilter({ att: e.detail })}"
        >
        </z-textfield>
        <z-textfield
          class="iv"
          type="number"
          min="0"
          .max=${MAX_IV}
          label="Defense IV"
          .disabled="${!pokemon.valid}"
          .value="${config.def}"
          @change="${e => updateFilter({ def: e.detail })}"
        >
        </z-textfield>
        <z-textfield
          class="iv"
          type="number"
          min="0"
          .max=${MAX_IV}
          label="Stamina IV"
          .disabled="${!pokemon.valid}"
          .value="${config.sta}"
          @change="${e => updateFilter({ sta: e.detail })}"
        >
        </z-textfield>
      </section>

      <h1 class="fh5">Filters</h1>

      <section class="filter">
        <span class="desc fbd1">
          Filter for pokemon that <b>potentially satisfy</b> minimum
          <abbr title="Individual Values">IV</abbr>
          criteria.
        </span>
        <z-button
          class="copy fbt"
          .disabled="${!passFilter.length}"
          @click="${copyFilterText("good")}"
          >Copy to Clipboard</z-button
        >
        <textarea
          id="good"
          class="text"
          readonly
          spellcheck="false"
          .value="${passFilter}"
        ></textarea>
        <span class="count fc">${passFilter.length} characters</span>
      </section>

      <section class="filter">
        <span class="desc fbd1">
          Filter for pokemon that <b>fail</b> minimum
          <abbr title="Individual Values">IV</abbr> criteria.
        </span>

        <z-button
          class="copy fbt"
          .disabled="${!failFilter.length}"
          @click="${copyFilterText("bad")}"
          >Copy to Clipboard</z-button
        >
        <textarea
          id="bad"
          class="text"
          readonly
          spellcheck="false"
          .value="${failFilter}"
        ></textarea>
        <span class="count fc">${failFilter.length} characters</span>
      </section>
    `;
  }

  get idleTemplate() {
    return html``;
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
          margin: 32px 16px 16px 16px;
        }

        p {
          margin: 16px;
          max-width: 640px;
        }

        b {
          font-weight: 500;
        }

        pokemon-selector {
          position: sticky;
          top: 16px;
          z-index: 1;
        }

        .config {
          margin: 16px;
          display: grid;
          grid-auto-rows: 64px;
          grid-template-columns: repeat(12, 1fr);
          grid-gap: 8px;
        }

        .filter {
          margin: 16px 16px 32px 16px;
          display: grid;
        }

        .desc {
          margin-bottom: 8px;
          margin-right: auto;
        }

        .copy {
          justify-self: start;
          margin: 8px 0;
        }

        .text {
          box-sizing: border-box;
          width: 100%;
          min-height: 160px;
          padding: 8px 8px 24px 8px;
          resize: vertical;
          border: 1px solid var(--bgb);
          outline: none;
          background: var(--bg1);
          color: var(--fgl);
        }

        .text:focus {
          border-color: var(--fgp);
        }

        .count {
          text-transform: none;
          color: var(--fgl);
        }

        .ivt {
          grid-column: span 12;
        }
        .iv {
          grid-column: span 4;
        }

        @media (min-width: 768px) {
          .ivt,
          .iv {
            grid-column: span 3;
          }
        }

        @media (min-width: 864px) {
          .ivt,
          .iv {
            grid-column: span 2;
          }
        }
      `
    ];
  }
}

window.customElements.define("pokemon-cpfilter", PokemonCPFilter);
