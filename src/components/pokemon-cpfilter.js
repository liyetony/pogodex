import { connect } from "pwa-helpers/connect-mixin"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import pokemon from "../redux/reducers/pokemon"
import { IVT_TIERS, MAX_IVT, MAX_IV } from "../modules/pokemon";
import { getPercent } from "../modules/helper";
import { getCPfilterProps, getCPFilterText } from "../redux/selectors/pokemon.cpfilter";
import { getPokemon } from "../redux/selectors/pokemon";
import { fontStyles } from "./~styles";
import "./pokemon-selector"
import "./ui-input"
import "./ui-button"
import { configCPFilter } from "../redux/actions/pokemon";
import { showSnackbar } from "../redux/actions/session";

store.addReducers({ pokemon })

class PokemonCPFilter extends connect(store)(LitElement) {
  static get properties() {
    return {
      pokemon: { type: Object },
      ivtOptions: { type: Array },
      config: { type: Object },
      filtertext: { type: String }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.ivtOptions = IVT_TIERS.map(ivt => `${getPercent(ivt, MAX_IVT)}%`)
  }

  stateChanged(state) {
    this.pokemon = getPokemon(state)
    this.config = getCPfilterProps(state)
    this.filtertext = getCPFilterText(state)
  }

  render() {
    return html`
      <pokemon-selector
        .name="${this.pokemon.name}"
        .swap="${this.pokemon.valid}">
      </pokemon-selector>
      ${this.pokemon.valid
        ? this.filterTemplate
        : this.idleTemplate
      }
    `
  }

  get idleTemplate() {
    return html``
  }

  get filterTemplate() {
    const { pokemon, ivtOptions, config, filtertext } = this

    function copyFilterText() {
      const $textarea = this.renderRoot.querySelector(".text")
      $textarea.select()
      document.execCommand("copy")
      store.dispatch(showSnackbar(`Copied ${pokemon.name} CP filter.`))
    }

    const updateFilter = props =>
      store.dispatch(configCPFilter({ ...config, ...props }))

    return html`
      <h1 class="heading fh5">CP Filter</h1>
      <header class="filter">
        <ui-input select required
          class="filter-ivt"
          label="Min IV Total"
          .options="${ivtOptions}"
          .value="${config.ivt}"
          @change="${e => updateFilter({ ivt: e.detail })}">
        </ui-input>
        <ui-input
          class="filter-iv"
          type="number" min="0" .max=${MAX_IV}
          label="Attack"
          .value="${config.att}"
          @change="${e => updateFilter({ att: e.detail })}">
        </ui-input>
        <ui-input
          class="filter-iv"
          type="number" min="0" .max=${MAX_IV}
          label="Defense"
          .value="${config.def}"
          @change="${e => updateFilter({ def: e.detail })}">
        </ui-input>
        <ui-input
          class="filter-iv"
          type="number" min="0" .max=${MAX_IV}
          label="Stamina"
          .value="${config.sta}"
          @change="${e => updateFilter({ sta: e.detail })}">
        </ui-input>
        <ui-button
          class="filter-copy"
          label="copy filter"
          ?disabled="${!filtertext.length}"
          @click="${copyFilterText}">
          <span class="fbt">Copy Filter</span>
        </ui-button>
      </header>

      <textarea id="filter" class="text"
        readonly
        spellcheck="false"
        .value="${filtertext}">
      </textarea>
      <span class="text-hint fc">${filtertext.length} characters</span>
      <label for="filter" style="opacity: 0">CP Filter</label>
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host { padding-bottom: 128px }
        
        .heading { margin: 24px 16px; color: var(--fg1-color); }

        .filter {
          margin: 16px;
          display: grid;
          grid-template: auto / repeat(12, 1fr);
          grid-gap: 16px 8px;
        }
        .filter-ivt { grid-column: span 12 }
        .filter-iv { grid-column: span 4 }
        .filter-copy { grid-column: span 12 }
        .filter-copy:not([disabled]) {
          color: var(--primary-color);
          border-color: currentColor;
        }

        .text {
          box-sizing: border-box;
          width: calc(100% - 32px);
          padding: 8px;
          margin: 16px 16px 0 16px;
          min-height: 160px;
          display: block;
          resize: vertical;
          border: 2px dashed var(--border-color);
          outline: none;
          background: none;
          color: var(--fg2-color);
        }
        .text-hint {
          margin: 0 16px 16px 16px;
          color: var(--fg3-color);
          text-transform: none;
        }

        @media (min-width: 768px) {
          .filter-ivt, .filter-iv { grid-column: span 3 }
        }

        @media (min-width: 864px) {
          .filter-ivt, .filter-iv { grid-column: span 2 }
          .filter-copy { grid-column: 11 / span 2 }
        }
      `
    ]
  }
}

window.customElements.define("pokemon-cpfilter", PokemonCPFilter)