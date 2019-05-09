import { LitElement, css, html } from "lit-element";
import { store } from "../redux/store";
import { appSearch } from "../redux/actions/session";
import { clearIcon, swapIcon, pokeballIcon } from "./@icons";
import { fontStyles } from "./@styles";
import "./+button";
class PokemonSelector extends LitElement {
  static get properties() {
    return {
      swap: { type: Boolean, reflect: true },
      name: { type: Object }
    };
  }

  render() {
    const { swap, name } = this;

    const deselectPokemon = e =>
      this.dispatchEvent(new CustomEvent("unset:pokemon", { composed: true }));

    return name
      ? html`
          <div class="selected">
            <z-button
              icon
              title="Deselect Pokemon"
              label="deselect pokemon"
              @click="${deselectPokemon}"
            >
              ${clearIcon}
            </z-button>
            <span class="fh6">${name}</span>
            <z-button
              icon
              title="Switch pokemon"
              label="switch pokemon"
              @click="${e => store.dispatch(appSearch(name))}"
            >
              ${swapIcon}
            </z-button>
          </div>
        `
      : html`
          <z-button
            class="select"
            fill
            title="Select pokemon"
            @click="${e => store.dispatch(appSearch(""))}"
          >
            ${pokeballIcon}
            <span class="fbt">Select Pokemon</span>
          </z-button>
        `;
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          display: block;
          margin: 16px;
          height: 56px;
        }

        .selected {
          height: 100%;
          padding: 0 8px;
          display: grid;
          grid-gap: 8px;
          grid-template-columns: 40px 1fr 40px;
          align-items: center;
          border: 1px solid var(--fgh);
          box-sizing: border-box;
          background: var(--bg4);
        }

        .select {
          width: 100%;
          height: 100%;
          justify-content: flex-start;
          border: 1px solid var(--fgh);
          box-sizing: border-box;
        }

        .select > .icon {
          padding: 8px;
          margin-right: 8px;
        }
      `
    ];
  }
}

window.customElements.define("pokemon-selector", PokemonSelector);
