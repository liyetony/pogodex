import { connect } from "pwa-helpers/connect-mixin";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import { getPage } from "../redux/selectors/session";
import {
  isSearching,
  getQuery,
  getQueriedPokemon
} from "../redux/selectors/session.search";
import { ROUTE } from "../modules/session";
import { cancelSearch, appSearch } from "../redux/actions/session";
import { lazyloadsImages } from "./@lazyload-images-mixin";
import { backIcon, pokeballIcon } from "./@icons";
import { fontStyles } from "./@styles";
import "./+button";

class AppSearch extends connect(store)(lazyloadsImages(LitElement)) {
  static get properties() {
    return {
      page: { type: String },
      searching: { type: Boolean },
      query: { type: String },
      pokemonList: { type: Array }
    };
  }

  stateChanged(state) {
    const page = getPage(state);
    this.page = page === ROUTE.HOME ? ROUTE.POKEDEX : page;
    this.searching = isSearching(state);
    this.query = getQuery(state);
    this.pokemonList = getQueriedPokemon(state);
  }

  updated(change) {
    if (change.has("searching") && this.searching) {
      const input = this.renderRoot.querySelector(".input");
      input.select();
    }

    this.lazyLoadImages();
  }

  render() {
    const { page, query, pokemonList } = this;

    const pokemonTemplate = pokemon => html`
      <a class="item" href="${page}#${pokemon.pid}">
        <div class="avatar">
          <img
            class="img"
            loading="lazy"
            data-src="${ROUTE.IMAGES.POKEMON}/${pokemon.image}.png"
            @load="${e => e.currentTarget.classList.add("ok")}"
          />
          ${pokeballIcon}
        </div>
        <span class="name">${pokemon.name}</span>
      </a>
    `;

    return html`
      <header class="header">
        <z-button icon @click="${e => store.dispatch(cancelSearch())}">
          ${backIcon}
        </z-button>
        <input
          class="input ffr ft"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="Search pokemon"
          .value="${query}"
          @input="${e =>
            store.dispatch(appSearch(e.currentTarget.value, true))}"
        />
      </header>

      <section class="list">
        ${pokemonList.map(pokemonTemplate)}
      </section>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          padding-bottom: calc(64px + var(--bottom));
        }

        .header {
          z-index: 1;
          position: sticky;
          top: 16px;
          padding: 0 8px;
          margin: 16px;
          display: grid;
          grid-template: 54px / 40px 1fr;
          grid-gap: 8px;
          align-items: center;
          border: 1px solid var(--bgb);
          background: var(--bg1);
          color: var(--fgl);
        }

        .header:focus-within {
          border-color: var(--fgp);
        }

        .input {
          height: 100%;
          border: none;
          outline: none;
          background: none;
          color: var(--fgh);
          text-transform: none !important;
        }

        .list {
          display: grid;
        }

        .item {
          padding-right: 16px;
          margin-left: 16px;
          display: grid;
          grid-template: 64px / 56px 1fr;
          grid-gap: 0 8px;
          align-items: center;
          outline: none;
          color: var(--fgl);
          text-decoration: none;
          border-bottom: 1px solid var(--bgb);
        }

        .avatar {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fgl);
        }

        .img {
          width: 100%;
          will-change: opacity;
          transition: opacity 0.3s var(--accelerate-easing);
          object-fit: contain;
        }

        .img ~ .icon {
          position: absolute;
          opacity: 0;
          will-change: opacity;
          transition: opacity 0.3s var(--decelerate-easing);
          fill: var(--fgl);
        }

        .img:not(.ok) {
          opacity: 0;
        }

        .img:not(.ok) ~ .icon {
          opacity: 1;
        }

        .name {
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
            padding-right: 0;
            margin-left: 0;
            grid-template: minmax(112px, 1fr) 3rem / 1fr;
            justify-items: center;
            border: 1px solid transparent;
          }

          .avatar {
            border-bottom: 1px solid var(--bgb);
          }

          .name {
            padding: 0 8px;
            text-align: center;
          }
        }

        @media (any-hover: hover) {
          .item:hover {
            background: var(--bgr-h);
            border-color: var(--bgb);
          }
        }

        .item:focus {
          background: var(--bgr-f);
          border-color: var(--bgb);
        }
      `
    ];
  }
}

window.customElements.define("app-search", AppSearch);
