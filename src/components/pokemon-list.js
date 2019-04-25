import { connect } from "pwa-helpers/connect-mixin"
import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import { searchIcon } from "./~icons"
import { fontStyles } from "./~styles"
import { appSearch } from "../redux/actions/session"
import "./ui-button"

class PokemonList extends connect(store)(LitElement) {
  render() {
    return html`
      <ui-button class="search"
        label="search"
        @click="${e => store.dispatch(appSearch(""))}">
        ${searchIcon}
        <span class="ft">Search</span>
      </ui-button>
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        .search {
          display: grid;
          grid-gap: 8px;
          grid-template: 56px / 40px 1fr;
          padding: 0 8px;
          margin: 16px;
          background: var(--bg2-color);
          color: var(--fg1-color);
        }
        .search:focus { border-color: var(--primary-color) }
        .search > .icon {
          margin: 8px 16px 8px 8px;
          fill: var(--fg2-color);
        }
      `
    ]
  }
}

window.customElements.define("pokemon-list", PokemonList)