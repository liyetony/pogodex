import { connect } from "pwa-helpers/connect-mixin";
import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import { appSearch } from "../redux/actions/session";
import { searchIcon } from "./@icons";
import { fontStyles } from "./@styles";
import "./+button";

class PokemonList extends connect(store)(LitElement) {
  render() {
    return html`
      <header class="header">
        <img src="images/manifest/icon.svg" />
        <h1 class="fh4">PoGo Pokedex</h1>
        <z-button
          class="search"
          label="search"
          toggle
          @click="${e => store.dispatch(appSearch(""))}"
        >
          ${searchIcon}
          <span class="ft">Search pokemon</span>
        </z-button>
      </header>
    `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        .header {
          padding: 64px 16px 16px 16px;
          display: grid;
          grid-template-columns: minmax(40px, 64px) minmax(240px, 1fr);
          grid-gap: 32px 8px;
          align-items: center;
          color: var(--fgh);
        }

        .header > img {
          width: 100%;
        }

        .header h1 {
          margin: 0;
        }

        .search {
          grid-column: span 2;
          height: 56px;
          display: flex;
          justify-content: flex-start;
          border: 1px solid var(--bgb);
          background: var(--bg1);
        }

        @media (any-hover: hover) {
          .search:hover {
            background-color: var(--bgr-h);
          }
        }

        .search:focus {
          background-color: var(--bgr-f);
        }

        .search .icon {
          padding: 8px;
          margin-right: 8px;
        }

        .search .ft {
          text-transform: none;
        }
      `
    ];
  }
}

window.customElements.define("pokemon-list", PokemonList);
