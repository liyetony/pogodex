import { connect } from "pwa-helpers/connect-mixin"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import { getPage } from "../redux/selectors/session"
import { isSearching, getQuery, getQueriedPokemon } from "../redux/selectors/session.search"
import { createLazyImageIntersectionObserver, lazyLoadImages } from "../redux/modules/helper"
import { ROUTE } from "../redux/modules/session"
import { cancelSearch, appSearch } from "../redux/actions/session"
import { backIcon, pokeballIcon } from "./~icons"
import { fontStyles } from "./~styles"

class AppSearch extends connect(store)(LitElement) {
  static get properties() {
    return {
      page: { type: String },
      searching: { type: Boolean },
      query: { type: String },
      pokemonList: { type: Array }
    }
  }

  stateChanged(state) {
    const page = getPage(state)
    this.page = page === ROUTE.HOME ? ROUTE.POKEDEX : page
    this.searching = isSearching(state)
    this.query = getQuery(state)
    this.pokemonList = getQueriedPokemon(state)
  }

  firstUpdated() {
    this.lazyImgObserver = createLazyImageIntersectionObserver()
  }

  updated(change) {
    if (change.has("searching") && this.searching) {
      const input = this.renderRoot.querySelector(".input");
      input.select()
    }

    const images = this.renderRoot.querySelectorAll("img[loading='lazy']")
    lazyLoadImages(this.lazyImgObserver, images)
  }

  render() {
    const { page, query, pokemonList } = this

    const pokemonTemplate = pokemon => html`
      <a class="item"
        href="${page}#${pokemon.pid}">
        <div class="item-avatar">
          <img class="item-img" loading="lazy"
            data-src="${ROUTE.IMAGES.POKEMON}/${pokemon.pid}.png"
            @load="${e => e.currentTarget.classList.add("ok")}">
          ${pokeballIcon}
        </div>
        <span class="item-name">${pokemon.name}</span>
      </a>
    `

    return html`
      <header class="header">
        <ui-button icon
          @click="${e => store.dispatch(cancelSearch())}">
          ${backIcon}
        </ui-button>
        <input class="input ffr ft"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          .value="${query}"
          @input="${e => store.dispatch(appSearch(e.currentTarget.value, true))}">
      </header>

      <section class="list">
        ${pokemonList.map(pokemonTemplate)}
      </section>
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host { padding-bottom: 128px }

        .header {
          z-index: 4;
          position: sticky;
          top: 16px;
          padding: 0 8px;
          margin: 16px;
          display: grid;
          grid-template: 56px / 40px 1fr;
          grid-gap: 8px;
          align-items: center;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg2-color);
          color: var(--fg2-color);
        }

        .header:focus-within { border-color: var(--primary-color) }

        .input {
          height: 100%;
          border: none;
          outline: none;
          background: none;
          color: var(--fg1-color);
        }

        .list { display: grid }

        .item {
          padding: 8px 18px;
          display: grid;
          grid-template: 40px / 40px 1fr;
          grid-gap: 0 8px;
          align-items: center;
          outline: none;
          color: var(--fg2-color);
          text-decoration: none;
        }
        .item:focus { background: var(--focus-color) }
        .item-avatar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg2-color);
        }
        .item-img {
          width: 100%;
          will-change: opacity;
          transition: opacity .3s var(--accelerate-easing);
          object-fit: contain;
        }
        .item-img ~ .icon {
          position: absolute;
          opacity: 0;
          will-change: opacity;
          transition: opacity .3s var(--decelerate-easing);
          fill: var(--fg2-color);
        }
        .item-img:not(.ok) { opacity: 0 }
        .item-img:not(.ok) ~ .icon { opacity: 1 }
        .item-name {
          font-weight: 400;
          font-size: 1rem;
          letter-spacing: 0.03125rem;
          -webkit-font-smoothing: antialiased;
        }

        @media (min-width: 552px) {
          .list {
            padding: 0 16px;
            grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
            grid-gap: 24px;
          }

          .item {
            padding: 0 0 8px 0;
            grid-template: minmax(112px, 1fr) 3rem / 1fr;
            border-bottom: 2px solid var(--border-color);
          }

          .item-name {
            padding: 0 8px;
            text-align: center;
          }
        }

        @media (any-hover: hover) {
          .item:hover { background: var(--focus-color) }
        }
      `
    ]
  }
}

window.customElements.define("app-search", AppSearch)