import { connect } from "pwa-helpers/connect-mixin"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import pokemon from "../redux/reducers/pokemon"
import { getPokemon } from "../redux/selectors/pokemon"
import { getTeam } from "../redux/selectors/settings"
import {
  getStardustOptions, getIVTOptions, getIVOptions,
  getAppraisalProps, getIVCombinations, getIVComboSorter
} from "../redux/selectors/pokemon.appraisal"
import {
  createLazyImageIntersectionObserver, lazyLoadImages, getPercent
} from "../redux/modules/helper"
import { TEAMS } from "../redux/modules/settings"
import { ROUTE } from "../redux/modules/session"
import { MAX_IVT } from "../redux/modules/pokemon"
import { setTeam } from "../redux/actions/settings"
import { configAppraisal, sortAppraisalIVCombos } from "../redux/actions/pokemon"
import { fontStyles } from "./~styles"
import "./pokemon-selector"
import "./ui-button"
import "./ui-input"
import "./ui-toggle"
import "./ui-sort"

store.addReducers({ pokemon })

class PokemonAppraisal extends connect(store)(LitElement) {
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
    }
  }

  stateChanged(state) {
    this.pokemon = getPokemon(state)
    this.team = getTeam(state)
    this.stardustOptions = getStardustOptions(state)
    this.ivtOptions = getIVTOptions(state)
    this.ivOptions = getIVOptions(state)
    this.config = getAppraisalProps(state)
    this.comboSorter = getIVComboSorter(state)
    this.combos = getIVCombinations(state)
  }

  firstUpdated() {
    this.lazyImgIntersectionObserver = createLazyImageIntersectionObserver()
  }

  updated() {
    const images = this.renderRoot.querySelectorAll("img[loading='lazy']")
    lazyLoadImages(this.lazyImgIntersectionObserver, images)
  }

  render() {
    const { pokemon } = this

    return html`
      <pokemon-selector
        .name="${pokemon.name}"
        .swap="${pokemon.valid}">
      </pokemon-selector>
      ${pokemon.valid 
        ? html`
          ${this.configTemplate}
          ${this.combosTemplate}`
        : this.idleTemplate
      }
    `
  }

  get idleTemplate() {
    return html`
    `
  }

  get configTemplate() {
    const { team, stardustOptions, ivtOptions, ivOptions, config } = this

    const updateConfig = (props, debounce = false) => {
      store.dispatch(configAppraisal({ ...config, ...props }, debounce))
    }

    const teamTemplate = (name, index) => html`
      <ui-button flat
        class="team"
        .label="${name}"
        ?active="${index === team}"
        @click="${e => store.dispatch(setTeam(index))}">
        <img class="team-lead"
          loading="lazy"
          alt="team ${name}"
          data-src="${ROUTE.IMAGES.TEAM}/${name}.png">
        <span class="fbt">${name}</span>
      </ui-button>
    `

    const appraisalTemplate = key => (text, index) => html`
      <ui-toggle
        class="${key}"
        type="radio"
        .label="${text}"
        ?checked="${index === config[key]}"
        @change="${e => updateConfig({ [key]: index })}">
        <span class="fbd2 label">${text}</span>
      </ui-toggle>
    `

    return html`
      <h1 class="heading fh5">Appraise</h1>
      <section class="stats">
        <ui-input required
          class="cp"
          label="CP"
          type="number" min="10"
          .value="${config.cp}"
          @change="${e => updateConfig({ cp: e.detail }, true)}">
        </ui-input>
        <ui-input required
          class="hp"
          label="HP"
          type="number" min="10"
          .value="${config.hp}"
          @change="${e => updateConfig({ hp: e.detail }, true)}">
        </ui-input>
        <ui-input required select
          class="sd"
          label="Stardust"
          type="number" min="10"
          .options="${stardustOptions}"
          .value="${config.sd}"
          @change="${e => updateConfig({ sd: e.detail })}">
        </ui-input>
        <ui-toggle
          class="lck"
          label="Lucky"
          .value="${config.lucky}"
          @change="${e => updateConfig({ lucky: e.detail })}">
          <span class="fbd2 label">Lucky</span>
        </ui-toggle>
      </section>
      <section class="appraisal">
        <div class="teams">${TEAMS.map(teamTemplate)}</div>
        <div class="ivs">
          ${ivtOptions.map(appraisalTemplate("ivt"))}
          <div class="iv-stats">
            <ui-toggle
              class="iv-stat"
              type="checkbox"
              label="Attack"
              ?checked="${config.att}"
              @change="${e => updateConfig({ att: e.detail })}">
            <span class="fbd2 label">Attack</span>
            </ui-toggle>
            <ui-toggle
              class="iv-stat"
              type="checkbox"
              label="Defense"
              ?checked="${config.def}"
              @change="${e => updateConfig({ def: e.detail })}">
              <span class="fbd2 label">Defense</span>

            </ui-toggle>
            <ui-toggle
              class="iv-stat"
              type="checkbox"
              label="Health"
              ?checked="${config.sta}"
              @change="${e => updateConfig({ sta: e.detail })}">
              <span class="fbd2 label">Health</span>
            </ui-toggle>
          </div>
          ${ivOptions.map(appraisalTemplate("iv"))}
        </div>
      </section>
    `
  }

  get combosTemplate() {
    const { combos } = this
    const [sortKey, sortOrder] = this.comboSorter

    const getOrder = key => key === sortKey ? sortOrder : 0
    const sort = key => e => store.dispatch(sortAppraisalIVCombos([key, e.detail]))

    const comboTemplate = combo => html`
      <div class="combo">
        <span>${getPercent(combo.ivt, MAX_IVT)}%</span>
        <span>${combo.att}</span>
        <span>${combo.def}</span>
        <span>${combo.sta}</span>
        <span>${combo.lv.toFixed(1)}</span>
      </div>
    `

    return html`
      <section class="combos">
        <h1 class="heading fh5">IV Combinations</h1>
        <header class="combo">
          <ui-sort
            label="IV Total"
            .order="${getOrder("ivt")}"
            @change="${sort("ivt")}">
            <abbr class="ft" title="Individual Value Total">IVT</abbr>
          </ui-sort>
          <ui-sort
            label="Attack"
            .order="${getOrder("att")}"
            @change="${sort("att")}">
            <span class="ft">Attack</span>
          </ui-sort>
          <ui-sort
            label="Defense"
            .order="${getOrder("def")}"
            @change="${sort("def")}">
            <span class="ft">Defense</span>
          </ui-sort>
          <ui-sort
            label="Stamina"
            .order="${getOrder("sta")}"
            @change="${sort("sta")}">
            <span class="ft">Stamina</span>
          </ui-sort>
          <ui-sort
            label="Level"
            .order="${getOrder("lv")}"
            @change="${sort("lv")}">
            <span class="ft">Level</span>
          </ui-sort>
        </header>
        ${combos.map(comboTemplate)}
        <p class="combo-none fbd1"
          ?hidden="${combos.length}">
          No combinations
        </p>
      </section>
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        abbr { text-decoration: none }

        .heading { margin: 24px 16px; color: var(--fg1-color); }

        .stats {
          margin: 32px 16px;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(48px, min-content);
          grid-gap: 16px 8px;
        }
        .cp, .hp { grid-column: span 6 }
        .sd { grid-column: span 7 }
        .lck {
          grid-column: span 5;
          justify-self: start;
          padding: 0 8px;
        }

        .appraisal { margin: 32px 0 }

        .teams {
          position: relative;
          display: grid;
          grid-template: min-content / repeat(auto-fill, minmax(min-content, 80px));
        }
        .teams:before {
          content: "";
          position: absolute;
          left: 0; bottom: 0;
          width: 100%;
          height: 2px;
          background: var(--border-color);
        }
        .team {
          flex-flow: column;
          box-sizing: border-box;
          padding: 5px 12px 4px 12px;
          border-bottom: 3px solid transparent;
          color: var(--fg2-color);
        }
        .team[active] { border-color: var(--primary-color) }
        .team-lead { width: 48px; height: 48px; margin-bottom: 4px; }
        .iv-stats { display: flex }
        .iv-stat { padding: 0 0 0 8px }
        .ivs {
          display: grid;
          grid-template: repeat(9, 64px) / 1fr;
          grid-auto-flow: column;
        }

        .combos {
          display: grid;
          padding-bottom: 128px;
        }
        .combo {
          min-height: 48px;
          display: grid;
          grid-template-columns: 56px repeat(auto-fit, minmax(40px, 1fr));
          grid-column-gap: 8px;
          align-items: center;
          color: var(--fg1-color);
        }
        .combo:not(header) { justify-items: center }

        header.combo {
          position: sticky;
          top: 0px;
          border-bottom: 2px solid var(--border-color);
          background: var(--bg1-color);
        }

        .combo-none {
          display: flex;
          justify-content: center;
          margin: 64px 16px;
          color: var(--fg3-color);
        }
        .combo-none[hidden] { display: none }


        @media (min-width: 640px) {
          .cp, .hp, .sd, .lck { grid-column: span 3 }
          .ivs { grid-template: repeat(5, 64px) / 1fr 1fr }
          .ivt { grid-column: 1 }
          .iv-stats, .iv { grid-column: 2 }
        }

        @media (any-hover: hover) {
          .combo:not(header):hover { background: var(--focus-color) }
        }
      `
    ]
  }
}

window.customElements.define("pokemon-appraisal", PokemonAppraisal)
