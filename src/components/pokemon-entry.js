import { connect } from "pwa-helpers/connect-mixin"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import pokemon from "../redux/reducers/pokemon"
import { getPokemon } from "../redux/selectors/pokemon";
import { getDisplayProps, getPokemonMovesPerspective, 
  getPokemonMovesSorter, getPokemonMoves } from "../redux/selectors/pokemon.entry"
import { getWeatherList } from "../redux/selectors/content";
import { getWeatherCondition } from "../redux/selectors/session";
import { createLazyImageIntersectionObserver, lazyLoadImages } from "../redux/modules/helper"
import { shinyIcon, maleIcon, femaleIcon, getWeatherIcon } from "./~icons"
import { fontStyles } from "./~styles";
import { ROUTE } from "../redux/modules/session";
import { configDisplay, sortMoves, setMovesPerspective } from "../redux/actions/pokemon";
import { flags, MOVE_PERSPECTIVES } from "../redux/modules/pokemon";
import { setWeather } from "../redux/actions/session";
import "./pokemon-selector"
import "./ui-button"
import "./ui-sort"
import "./hammer.min.js"

store.addReducers({ pokemon })

class PokemonEntry extends connect(store)(LitElement) {
  static get properties() {
    return {
      pokemon: { type: Object },
      display: { type: Object },
      weatherList: { type: Array },
      weather: { type: Number },
      moves: { type: Array },
      movesPerspective: { type: Number },
      movesSorter: { type: Array }
    }
  }

  stateChanged(state) {
    this.pokemon = getPokemon(state)
    this.display = getDisplayProps(state)
    this.weatherList = getWeatherList(state)
    this.weather = getWeatherCondition(state)
    this.movesPerspective = getPokemonMovesPerspective(state)
    this.movesSorter = getPokemonMovesSorter(state)
    this.moves = getPokemonMoves(state)
  }

  firstUpdated() {
    this.lazyImgIntersectionObserver = createLazyImageIntersectionObserver()

    const switchPokemon = pid =>
      this.dispatchEvent(new CustomEvent("set:pokemon", { detail: pid, composed: true }))

    const pokedex = this.renderRoot.querySelector(".pokedex")
    const hammer = new Hammer(pokedex)
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL })
    hammer.on("swipeleft", e => switchPokemon(this.pokemon.next))
    hammer.on("swiperight", e => switchPokemon(this.pokemon.prev))
  }

  updated(change) {
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
          ${this.pokedexTemplate}
          ${this.movesTemplate}`
        : this.idleTemplate
      }
    `
  }

  get idleTemplate() {
    return html``
  }

  get pokedexTemplate() {
    const { pokemon, display } = this

    const shiny = display.shiny ? "s" : ""
    const female = display.gender ? "f" : ""
    const displayImgUrl = `${ROUTE.IMAGES.POKEMON}/${pokemon.pid}${shiny}${female}.png`
    const hasShiny = pokemon.img & flags.img.shiny
    const hasGender = pokemon.img & flags.img.gender

    const updateDisplayProps = props => e =>
      store.dispatch(configDisplay({ ...display, ...props }))

    return html`
      <section class="pokedex">
        <div class="display">
          <img class="display-img" loading="lazy" data-src="${displayImgUrl}">
          <div class="display-conf">
            <ui-button icon
              class="display-ctrl shiny"
              ?hidden="${!hasShiny}"
              ?active="${display.shiny}"
              @click="${updateDisplayProps({ shiny: display.shiny ^ 1 })}">
              ${shinyIcon}
            </ui-button>
            <ui-button icon
              class="display-ctrl male"
              ?hidden="${!hasGender}"
              ?active="${!display.gender}"
              @click="${updateDisplayProps({ gender: 0 })}">
              ${maleIcon}
            </ui-button>
            <ui-button icon
              class="display-ctrl female"
              ?hidden="${!hasGender}"
              ?active="${display.gender}"
              @click="${updateDisplayProps({ gender: 1 })}">
              ${femaleIcon}
            </ui-button>
          </div>
        </div>
        <div class="entry">
          ${pokemon.types.map(type => html`
            <img class="entry-type" loading="lazy" data-src="${getTypeImageUrl(type)}">
          `)}
          <h1 class="entry-category fh6">${pokemon.category}</h1>
          <p class="entry-desc fbd1">${pokemon.desc}</p>
          <div class="entry-items">
            <div class="entry-item">
              <div class="fst">Weight</div>
              <div class="fbd1">${pokemon.weight}<span class="fbd2">kg</span></div>
            </div>
            <div class="entry-item">
              <div class="fst">Height</div>
              <div class="fbd1">${pokemon.height}<span class="fbd2">m</span></div>
            </div>
            <div class="entry-item">
              <div class="fst">Walk</div>
              <div class="fbd1">${pokemon.dist}<span class="fbd2">km</span></div>
            </div>
          </div>
        </div>
      </section>
    `
  }

  get movesTemplate() {
    const { weatherList, weather, movesPerspective, moves } = this
    const [sortKey, sortOrder] = this.movesSorter

    const getOrder = key => key === sortKey ? sortOrder : 0
    const sort = key => e => store.dispatch(sortMoves([key, e.detail]))
    const changeWeather = id => e => {
      const unset = id === weather
      store.dispatch(setWeather(unset ? undefined : id))
    }

    const addSign = val => `${val > 0 ? "+" : ""}${val}`

    const weatherTemplate = ({name}, index) => html`
      <ui-button icon
        class="weather"
        label="${name}"
        ?active="${index === weather}"
        @click="${changeWeather(index)}">
        ${getWeatherIcon(index)}
      </ui-button>
    `

    const moveTemplate = move => html`
      <div class="move">
        <img class="move-type" loading="lazy" data-src="${getTypeImageUrl(move.type)}">
        <div class="move-desc">
          <div class="move-name fbd1">${move.name}</div>
          <div class="move-tags fc">${move.tags}</div>
          <div class="move-buffs fbd2"
            ?hidden="${movesPerspective === 0}">
            ${move.buffs}</div>
        </div>
        <span class="move-val energy fh6">${addSign(move.energy)}</span>
        <span class="move-val power fh6"
          ?boosted="${move.boosted}">
          ${move.power}
        </span>
      </div>
    `

    return html`
      <section class="moves">
        <h1 class="heading fh5">Move Details</h1>

        <header class="move-conf">
          <div class="move-views">
          ${MOVE_PERSPECTIVES.map((view, index) => html`
            <ui-button flat
              class="move-view"
              label="${view}"
              ?active="${index === movesPerspective}"
              @click="${e => store.dispatch(setMovesPerspective(index))}">
              <span class="fbt">${view}</span>
            </ui-button>
          `)}
          </div>
          <div class="weather-list">
            ${weatherList.map(weatherTemplate)}
          </div>
        </header>

        <header class="move">
          <ui-sort
            label="type"
            .order="${getOrder("type")}"
            @change="${sort("type")}">
            <span class="ft">Type</span>
          </ui-sort>
          <ui-sort
            label="name"
            place="start"
            .order="${getOrder("name")}"
            @change="${sort("name")}">
            <span class="ft">Name</span>
          </ui-sort>
          <ui-sort
            label="energy"
            .order="${getOrder("energy")}"
            @change="${sort("energy")}">
            <span class="ft">Energy</span>
          </ui-sort>
          <ui-sort
            label="power"
            .order="${getOrder("power")}"
            @change="${sort("power")}">
            <span class="ft">Power</span>
          </ui-sort>
        </header>
        ${moves.map(moveTemplate)}
      </section>
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        .pokedex {
          display: grid;
          grid-template:
            "display" auto
            "entry" auto;
        }

        .heading { padding: 24px 16px 0 16px; margin-bottom: 24px; }

        .display {
          grid-area: display;
          margin: 0 16px;
          display: flex;
          flex-flow: column;
          align-items: center;
          color: var(--fg2-color);
        }

        .display-ctrl { display: inline-flex }
        .display-ctrl > .icon { fill: currentColor }
        .display-ctrl.shiny[active] { color: #FBC02D }
        .display-ctrl.male[active] { color: #03A9F4 }
        .display-ctrl.female[active] { color: #E91E63 }
        .display-ctrl[hidden] { display: none }

        .entry {
          grid-area: entry;
          margin: 0 16px;
          align-self: center;
          color: var(--fg1-color);
        }
        .entry-type { width: 28px; height: 28px; }
        .entry-category, .entry-desc {margin: 16px 0 }
        .entry-desc { max-width: var(--p-width) }
        .entry-items {
          display: grid;
          grid-gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(min-content, 64px));
        }
        .entry-item {
          display: inline-flex;
          flex-flow: column;
          align-items: center;
        }
        .entry-item .fbd2 { margin-left: 2px; color: var(--fg2-color) }

        .moves {
          padding-bottom: 128px;
          margin-top: 32px;
          color: var(--fg1-color);
        }

        .move-conf {
          margin: 16px 0;
          display: grid;
          grid-gap: 16px;
          grid-template: auto auto / 1fr;
          align-items: center;
        }
        .move-views {
          margin: 0 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }
        .move-view {
          padding: 0 8px;
          text-align: center;
          color: var(--fg2-color);
        }
        .move-view[active] { color: var(--primary-color) }

        .weather-list { display: flex; justify-content: center; }
        .weather[active] { color: var(--primary-color) }

        .move {
          min-height: 64px;
          display: grid;
          grid-template-columns: 56px 1fr 64px 64px;
          align-items: center;
        }
        .move > * { padding: 0 8px }
        .move-type { width: 40px; height: 40px; }
        .move-desc { grid-area: 1 / 2 / 1 / span 3; }
        .move-tags { color: var(--fg2-color); text-transform: none; }
        .move-buffs { color: var(--fg1-color); text-transform: none; }
        .move-val { justify-self: end; padding-right: 16px }
        .move-val.energy { grid-area: 1 / 3 / 1 / 3; color: var(--fg2-color); }
        .move-val.power { grid-area: 1 / 4 / 1 / 4 }
        .move-val.power[boosted] { color: var(--primary-color) }


        header.move {
          z-index: 1;
          position: sticky;
          top: 0px;
          background: var(--bg1-color);
          border-bottom: 2px solid var(--border-color);
        }

        @media (min-width: 640px) {
          .pokedex {
            grid-template: 
              "display entry" auto
              / minmax(min-content, 256px) 1fr;
          }
        }

        @media (min-width: 728px) {
          .move-conf {
            grid-template: auto / 1fr 1fr;
            grid-gap: 0; 
          }
          .move-views { justify-self: start }
          .weather-list { justify-self: end }
        }

        @media (any-hover: hover) {
          .move:not(header):hover { background: var(--focus-color) }
        }
      `
    ]
  }
}

window.customElements.define("pokemon-entry", PokemonEntry)

function getTypeImageUrl(type) {
  return `${ROUTE.IMAGES.TYPE}/${type}.png`
}