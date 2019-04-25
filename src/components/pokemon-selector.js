import { LitElement, css, html } from "lit-element"
import { store } from "../redux/store"
import { clearIcon, swapIcon, pokeballIcon } from "./~icons";
import { fontStyles } from "./~styles"
import { appSearch } from "../redux/actions/session"

class PokemonSelector extends LitElement {
  static get properties() {
    return {
      swap: { type: Boolean, reflect: true },
      name: { type: Object }
    }
  }

  render() {
    const { swap, name } = this
    
    const deselectPokemon = e =>
      this.dispatchEvent(new CustomEvent("unset:pokemon", { composed: true }))

    return swap
      ? html`
        <div class="swap">
          <ui-button icon
            label="deselect pokemon"
            @click="${deselectPokemon}">
            ${clearIcon}
          </ui-button>
          <span class="fh6">${name}</span>
          <ui-button icon
            label="switch pokemon"
            @click="${e => store.dispatch(appSearch(name))}">
            ${swapIcon}
          </ui-button>
        </div>
      `
      : html`
        <ui-button flat
          place="start"
          class="select"
          @click="${e => store.dispatch(appSearch(""))}">
          ${pokeballIcon}
          <span class="fbt">Select Pokemon</span>
        </ui-button>
      `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          display: block;
          margin: 16px;
          height: 56px;
          background: var(--bg2-color);
          color: var(--fg1-color);
          border: 2px solid var(--border-color);
          border-radius: 4px;
        }

        :host(:not([swap])) { border-color: var(--primary-color) }

        .swap {
          display: grid;
          grid-gap: 8px;
          grid-template-columns: 40px 1fr 40px;
          align-items: center;
          height: 100%;
          padding: 0 8px;
        }

        .select {
          height: 100%;
          color: var(--primary-color);
        }
        .select > .icon {
          padding: 8px;
          margin-right: 8px;
        }
      `
    ]
  }
}

window.customElements.define("pokemon-selector", PokemonSelector)