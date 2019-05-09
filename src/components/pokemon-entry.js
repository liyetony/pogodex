import { connect } from "pwa-helpers/connect-mixin";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import pokemon from "../redux/reducers/pokemon";

import { getWeatherList, getTypeList } from "../redux/selectors/content";
import { getWeatherCondition } from "../redux/selectors/session";
import { getPokemon } from "../redux/selectors/pokemon";
import {
  getPokemonImageDisplayProps,
  getPokemonMoveListDisplayProps,
  getPokemonMoveListSorter,
  getPokemonMoveList
} from "../redux/selectors/pokemon.entry";

import {
  configImageDisplay,
  configMoveDisplay,
  sortMoves
} from "../redux/actions/pokemon";
import { setWeather } from "../redux/actions/session";

import { ROUTE } from "../modules/session";
import { BATTLE_TYPES } from "../modules/pokemon";
import { lazyloadsImages } from "./@lazyload-images-mixin";
import {
  shinyIcon,
  maleIcon,
  femaleIcon,
  getWeatherIcon,
  prevIcon,
  nextIcon,
  boostIcon,
  gridIcon,
  listIcon
} from "./@icons";
import { fontStyles } from "./@styles";
import "./pokemon-selector";
import "./hammer.min.js";
import "./+button";
import "./+order";

store.addReducers({ pokemon });
class PokemonEntry extends connect(store)(lazyloadsImages(LitElement)) {
  static get properties() {
    return {
      weatherConditions: { type: Array },
      weatherCondition: { type: Number },
      types: { type: Array },
      pokemon: { type: Object },
      imageDisplay: { type: Object },
      moveListDisplay: { type: Object },
      moveListSorter: { type: Array },
      moveList: { type: Array }
    };
  }

  stateChanged(state) {
    this.weatherConditions = getWeatherList(state);
    this.weatherCondition = getWeatherCondition(state);
    this.types = getTypeList(state);
    this.pokemon = getPokemon(state);
    this.imageDisplay = getPokemonImageDisplayProps(state);
    this.moveListDisplay = getPokemonMoveListDisplayProps(state);
    this.moveListSorter = getPokemonMoveListSorter(state);
    this.moveList = getPokemonMoveList(state);
  }

  _setPokemon(pid) {
    this.dispatchEvent(
      new CustomEvent("set:pokemon", { detail: pid, composed: true })
    );
  }

  firstUpdated() {
    const swipeTarget = this.renderRoot.querySelector(".header");
    const swipeManager = new Hammer(swipeTarget);
    this._swiperManager = swipeManager;
    swipeManager.get("swipe").set({ direction: Hammer.DIRECTION_HORIZONTAL });
    swipeManager.on("swipeleft", e => {
      if (this.pokemon.next && this.pokemon.next.pid)
        this._setPokemon(this.pokemon.next.pid);
    });
    swipeManager.on("swiperight", e => {
      if (this.pokemon.prev && this.pokemon.prev.pid)
        this._setPokemon(this.pokemon.prev.pid);
    });
  }

  updated(change) {
    this.lazyLoadImages();
  }

  render() {
    let { pokemon, moveList } = this;

    return html`
      <header class="header">
        <pokemon-selector .name="${pokemon.name}"></pokemon-selector>
        <header class="nav">
          <z-button
            class="nav-prev"
            ?disabled="${!pokemon.prev.pid}"
            @click="${e => this._setPokemon(pokemon.prev.pid)}"
          >
            ${prevIcon}
            <span class="fbd2">${pokemon.prev.name || "previous"}</span>
          </z-button>
          <z-button
            class="nav-next"
            ?disabled="${!pokemon.next.pid}"
            @click="${e => this._setPokemon(pokemon.next.pid)}"
          >
            <span class="fbd2">${pokemon.next.name || "next"}</span>
            ${nextIcon}
          </z-button>
        </header>
      </header>
      ${pokemon.valid ? this._pokedexTemplate : ""}
      ${moveList.length > 0 ? this._moveListConfigTemplate : ""}
      ${moveList.length > 0 ? this._moveListTemplate : ""}
    `;
  }

  get _pokedexTemplate() {
    const { types, pokemon, imageDisplay: view } = this;

    const shiny = view.shiny ? "s" : "";
    const female = view.gender ? "f" : "";
    const url = `${ROUTE.IMAGES.POKEMON}/${pokemon.image}${shiny}${female}.png`;

    const configDisplay = props => e =>
      store.dispatch(configImageDisplay({ ...view, ...props }));

    const typeTemplate = type => html`
      <img
        class="dex-type"
        loading="lazy"
        title="${types[type].name || ""} type"
        alt="${types[type].name || ""}"
        data-src="${ROUTE.IMAGES.TYPE}/${type}.png"
        @load="${e => e.currentTarget.classList.add("ok")}"
      />
    `;

    return html`
      <section class="dex">
        <div class="dex-img">
          <img
            loading="lazy"
            alt="${pokemon.name}"
            data-src="${url}"
            @load="${e => e.currentTarget.classList.add("ok")}"
          />
        </div>
        <div class="dex-icons">
          ${pokemon.types.map(typeTemplate)}
          <z-button
            icon
            class="dex-alt shiny"
            title="${view.shiny ? "hide" : "show"} shiny"
            ?hidden="${!pokemon.altShiny}"
            ?active="${view.shiny}"
            @click="${configDisplay({ shiny: view.shiny ^ 1 })}"
            >${shinyIcon}
          </z-button>
          <z-button
            class="dex-alt male"
            icon
            ?hidden="${!pokemon.altGender}"
            ?active="${!view.gender}"
            @click="${configDisplay({ gender: 0 })}"
            >${maleIcon}
          </z-button>
          <z-button
            class="dex-alt female"
            icon
            ?hidden="${!pokemon.altGender}"
            ?active="${view.gender}"
            @click="${configDisplay({ gender: 1 })}"
            >${femaleIcon}
          </z-button>
        </div>
        <h2 class="dex-category fh6">${pokemon.category}</h2>
        <p class="dex-desc fbd1">${pokemon.desc}</p>
        <div class="dex-items">
          <div>
            <div class="dex-item fbd2">Weight</div>
            <div class="fbd1">${pokemon.weight} kg</div>
          </div>
          <div>
            <div class="dex-item fbd2">Height</div>
            <div class="fbd1">${pokemon.height} m</div>
          </div>
          <div title="buddy walking distance">
            <div class="dex-item fbd2">Walk</div>
            <div class="fbd1">${pokemon.dist} km</div>
          </div>
        </div>
      </section>
    `;
  }

  get _moveListConfigTemplate() {
    const { weatherConditions, weatherCondition, moveListDisplay: view } = this;
    const [sortKey, sortOrder] = this.moveListSorter;

    const getOrder = key => (key === sortKey ? sortOrder : 0);

    const changeWeather = id => e => {
      const unset = id === weatherCondition;
      store.dispatch(setWeather(unset ? undefined : id));
    };

    const configDisplay = props => {
      store.dispatch(configMoveDisplay({ ...view, ...props }));
    };

    const sort = key => e => store.dispatch(sortMoves([key, e.detail]));

    const battleTypeTemplate = (name, index) => html`
      <z-button
        class="battle-type"
        .label="${name}"
        ?active="${index === view.battle}"
        @click="${e => configDisplay({ battle: index })}"
      >
        <span class="fbt">${name}</span>
      </z-button>
    `;

    const weatherTemplate = ({ name }, index) => html`
      <z-button
        icon
        title="${name}"
        label="${name}"
        ?active="${index === weatherCondition}"
        @click="${changeWeather(index)}"
        >${getWeatherIcon(index)}
      </z-button>
    `;

    return html`
      <header class="moves-header">
        <h1 class="fh5">Moves</h1>
        <z-button
          icon
          title="${view.grid ? "Grid" : "List"} View"
          @change="${e => configDisplay({ grid: !view.grid })}"
        >
          ${view.grid ? gridIcon : listIcon}
        </z-button>
      </header>

      <header class="moves-setup">
        <div class="battle-types">
          ${BATTLE_TYPES.map(battleTypeTemplate)}
          <div class="battle-type-border" style="--shift: ${view.battle}"></div>
        </div>
        <div class="weather-conditions">
          ${weatherConditions.map(weatherTemplate)}
        </div>
      </header>

      <header
        class="move row sorter"
        title="Sort move list"
        ?grid="${view.grid}"
      >
        <z-order
          label="Type"
          .order="${getOrder("type")}"
          @change="${sort("type")}"
        ></z-order>
        <z-order
          label="Name"
          .order="${getOrder("name")}"
          @change="${sort("name")}"
        ></z-order>
        <z-order
          label="Energy"
          .order="${getOrder("energy")}"
          @change="${sort("energy")}"
        ></z-order>
        <z-order
          label="Power"
          .order="${getOrder("power")}"
          @change="${sort("power")}"
        ></z-order>
      </header>
    `;
  }

  get _moveListTemplate() {
    const { types, moveListDisplay: view, moveList } = this;

    const addSign = val => `${val > 0 ? "+" : ""}${val}`;

    const moveBuffTemplate = buff => html`
      <div class="buff fbd2">${buff}</div>
    `;

    const moveTagTemplate = tag =>
      html`
        <div class="tag fc">${tag}</div>
      `;

    const moveRowTemplate = move => html`
      <div class="move row li">
        <img
          class="type"
          loading="lazy"
          title="${types[move.type].name || ""} type"
          alt="${types[move.type].name || "Missing pokemon type"}"
          data-src="${ROUTE.IMAGES.TYPE}/${move.type}.png"
          @load="${e => e.currentTarget.classList.add("ok")}"
        />
        <div>
          <div class="name fbd1">${move.name}</div>
          <div class="tags">${move.tags.map(moveTagTemplate)}</div>
        </div>
        <div
          class="val fh6"
          title="energy ${move.energy > 0 ? "gain" : "cost"}"
        >
          ${addSign(move.energy)}
        </div>
        <div class="val">
          <span
            class="power fh6"
            title="${move.boosted ? "weather boosted" : ""} power"
            ?boosted="${move.boosted}"
          >
            ${boostIcon}${move.power}
          </span>
        </div>
        <div class="buffs" ?hidden="${view.battle == 0}">
          ${move.buffs.map(moveBuffTemplate)}
        </div>
      </div>
    `;

    const moveCardTemplate = move => html`
      <div class="move card">
        <header class="header">
          <img
            class="type"
            loading="lazy"
            title="${types[move.type].name || ""} type"
            alt="${types[move.type].name || "Missing pokemon type"}"
            data-src="${ROUTE.IMAGES.TYPE}/${move.type}.png"
            @load="${e => e.currentTarget.classList.add("ok")}"
          />
          <span class="name fh6">${move.name}</span>
          <div class="tags">${move.tags.map(moveTagTemplate)}</div>
        </header>
        <div class="val" title="energy ${move.energy > 0 ? "gain" : "cost"}">
          <div class="fh5">${addSign(move.energy)}</div>
          <div class="fc">Energy</div>
        </div>
        <div class="val" title="${move.boosted ? "weather boosted" : ""} power">
          <span class="power fh5" ?boosted="${move.boosted}">
            ${boostIcon}${move.power}
          </span>
          <div class="fc">Power</div>
        </div>
        <div class="buffs" ?hidden="${view.battle == 0}">
          ${move.buffs.map(moveBuffTemplate)}
        </div>
      </div>
    `;

    return html`
      <div class="moves" ?grid="${view.grid}">
        ${moveList.map(view.grid ? moveCardTemplate : moveRowTemplate)}
      </div>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          color: var(--fgh);
          padding-bottom: calc(64px + var(--bottom));
        }

        .nav {
          display: grid;
          grid-template: 56px / 1fr 1fr;
          align-items: center;
          justify-self: stretch;
          margin: 0 16px;
        }

        .nav-prev {
          padding-left: 0;
          justify-self: start;
        }

        .nav-next {
          padding-right: 0;
          justify-self: end;
        }

        .dex {
          display: grid;
          grid-auto-flow: row dense;
          justify-items: center;
          margin: 16px;
        }

        .dex-img {
          position: relative;
        }

        .dex-icons {
          display: flex;
          height: 40px;
        }

        .dex-type {
          width: 28px;
          height: 28px;
          padding: 6px;
        }

        .dex-alt {
          color: var(--fgl);
        }

        .dex-alt:focus {
          background: var(--bgr-f);
        }

        .dex-alt.shiny[active] {
          color: #fbc02d;
        }

        .dex-alt.male[active] {
          color: #03a9f4;
        }

        .dex-alt.female[active] {
          color: #e91e63;
        }

        .dex-category {
          margin: 24px 0 8px 0;
        }

        .dex-desc {
          max-width: 320px;
          margin: 8px 0 16px 0;
        }

        .dex-items {
          display: grid;
          grid-column-gap: 16px;
          grid-template-columns: repeat(3, 64px);
        }

        .dex-item {
          color: var(--fgl);
        }

        .moves-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--fgl);
          height: 56px;
          padding-right: 9px;
          margin: 32px 16px 16px 16px;
        }

        .moves-setup {
          display: grid;
          grid-template: 40px 40px / 1fr;
          grid-gap: 16px;
          justify-items: center;
          margin: 16px;
        }

        .battle-types {
          position: relative;
          display: flex;
          max-width: 288px;
          height: 40px;
          margin-bottom: 16px;
        }

        .battle-type-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 144px;
          height: 100%;
          border: 1px solid var(--fgp);
          box-sizing: border-box;
          will-change: transform;
          transform: translateX(calc(144px * var(--shift)));
          transition: transform 0.1s var(--standard-easing);
        }

        .battle-type {
          width: 144px;
          padding: 0 4px;
          text-align: center;
        }

        .weather-conditions {
          display: flex;
        }

        .move img:not(.ok) {
          opacity: 0;
        }

        .move .tags {
          display: flex;
        }

        .move .tag {
          padding: 1px 4px;
          background: var(--bgb);
          color: var(--fgl);
        }

        .move .power {
          position: relative;
          display: flex;
          align-items: center;
          fill: currentColor;
        }

        .move .power[boosted] {
          color: var(--fgp);
        }

        .move .power .icon {
          position: absolute;
          left: -24px;
        }

        .move .power:not([boosted]) .icon {
          display: none;
        }

        .move.row {
          display: grid;
          grid-template-columns: 56px 1fr 64px 72px;
          align-items: center;
          margin: 0 auto;
        }

        .move.row.sorter {
          border-bottom: 1px solid var(--fgl);
        }

        .move.row.sorter[grid] {
          grid-template-columns: repeat(4, 64px);
          border: 1px solid var(--fgl);
          width: 258px;
          margin: 0 auto;
        }

        .move.row.sorter > :nth-child(2) {
          align-items: flex-start;
        }

        .move.row.sorter > :nth-child(3),
        .move.row.sorter > :nth-child(4) {
          align-items: flex-end;
        }

        .move.row.li {
          padding-bottom: 4px;
        }

        .move.row.li:not(:last-child) {
          border-bottom: 1px solid var(--bgb);
        }

        .move.row.li .type {
          width: 40px;
          height: 40px;
          margin: 12px 8px;
        }

        .move.row.li .name {
          margin: 0 8px;
        }

        .move.row.li .tag {
          margin-top: 2px;
          margin-left: 8px;
        }

        .move.row.li .val {
          padding-right: 8px;
          justify-self: end;
        }

        .move.row.li .buffs {
          grid-column: 2 / span 3;
          margin: 0 8px;
        }

        .moves[grid] {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
          align-items: start;
          grid-gap: 16px 40px;
          margin: 40px 16px;
        }

        .move.card {
          display: grid;
          grid-template: 64px 64px auto / 1fr 1fr;
          grid-gap: 8px;
          border: 1px solid var(--fgl);
          background: var(--bg0);
          color: var(--fgh);
          padding-bottom: 16px;
        }

        .move.card .header {
          grid-column: span 2;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 32px 8px 0 8px;
        }

        .move.card .type {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .move.card .tags {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .move.card .tag {
          margin-left: 4px;
        }

        .move.card .name {
          grid-column: span 2;
          text-align: center;
        }

        .move.card .val {
          justify-self: center;
          text-align: center;
        }

        .move.card .val > :last-child {
          color: var(--fgl);
        }

        .move.card .power {
          justify-content: center;
        }

        .move.card .buffs {
          grid-column: span 2;
        }

        .move.card .buff {
          margin: 0 16px 4px 16px;
        }

        @media (min-width: 420px) {
          .move.row {
            margin: 0 16px;
          }

          .moves[grid] {
            grid-gap: 40px;
          }
        }

        @media (min-width: 640px) {
          .dex {
            grid-template-columns: 1fr 1fr;
            justify-items: start;
            grid-column-gap: 24px;
          }

          .dex-img {
            grid-row: span 4;
            justify-self: end;
          }
        }

        @media (min-width: 728px) {
          .moves-setup {
            grid-template: 40px / 1fr 1fr;
            justify-items: start;
          }

          .weather-conditions {
            justify-self: end;
            margin-right: 9px;
          }

          .move.row.sorter[grid] {
            width: 258px;
            margin: 0 auto 0 16px;
          }
        }

        @media (any-hover: hover) {
          .move.row.li:hover {
            background: var(--bgr-h);
          }
        }
      `
    ];
  }

  get movesTemplate() {
    const { weatherConditions, weather, types, moves } = this;

    const changeWeather = id => e => {
      const unset = id === weather;
      store.dispatch(setWeather(unset ? undefined : id));
    };

    const [sortKey, sortOrder] = this.moveListSorter;
    const getOrder = key => (key === sortKey ? sortOrder : 0);
    const sort = key => e => store.dispatch(sortMoves([key, e.detail]));
    const addSign = val => `${val > 0 ? "+" : ""}${val}`;

    const weatherTemplate = ({ name }, index) => html`
      <ui-button
        icon
        class="weather"
        label="${name}"
        ?active="${index === weather}"
        @click="${changeWeather(index)}"
      >
        ${getWeatherIcon(index)}
      </ui-button>
    `;

    const moveTemplate = move => html`
      <div class="move">
        <img
          class="move-type"
          loading="lazy"
          alt="${getTypeName(types, move.type)}"
          data-src="${getTypeImageUrl(move.type)}"
          @load="${e => e.currentTarget.classList.add("ok")}"
        />
        <div class="move-desc">
          <div class="move-name fbd1">${move.name}</div>
          <div class="move-tags fc">${move.tags}</div>
          <div class="move-buffs fbd2" ?hidden="${battleType === 0}">
            ${move.buffs}
          </div>
        </div>
        <span class="move-val energy fh6">${addSign(move.energy)}</span>
        <span class="move-val power fh6" ?boosted="${move.boosted}">
          ${move.power}
        </span>
      </div>
    `;

    return html`
      <section class="moves">
        <h1 class="heading fh5">Move Details</h1>

        <header class="move-conf">
          <div class="move-views">
            ${BATTLE_TYPES.map(
              (view, index) => html`
                <ui-button
                  flat
                  class="move-view"
                  label="${view}"
                  ?active="${index === battleType}"
                >
                  <span class="fbt">${view}</span>
                </ui-button>
              `
            )}
          </div>
          <div class="weather-list">
            ${weatherConditions.map(weatherTemplate)}
          </div>
        </header>

        <header class="move">
          <ui-sort
            label="type"
            .order="${getOrder("type")}"
            @change="${sort("type")}"
          >
            <span class="ft">Type</span>
          </ui-sort>
          <ui-sort
            label="name"
            place="start"
            .order="${getOrder("name")}"
            @change="${sort("name")}"
          >
            <span class="ft">Name</span>
          </ui-sort>
          <ui-sort
            label="energy"
            .order="${getOrder("energy")}"
            @change="${sort("energy")}"
          >
            <span class="ft">Energy</span>
          </ui-sort>
          <ui-sort
            label="power"
            .order="${getOrder("power")}"
            @change="${sort("power")}"
          >
            <span class="ft">Power</span>
          </ui-sort>
        </header>
        ${moves.map(moveTemplate)}
      </section>
    `;
  }
}

window.customElements.define("pokemon-entry", PokemonEntry);
