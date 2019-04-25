import { LitElement, css, html } from "lit-element"
import { dropdownIcon } from "./~icons"

class UISort extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
      order: { type: Number, reflect: true },
      place: { type: String, reflect: true },
      label: { type: String }
    }
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true })
  }

  render() {
    const { order = 0, disabled, label } = this

    const fireChangeEvent = e => {
      const next = order * -1 || 1
      this.order = next
      this.dispatchEvent(new CustomEvent("change", { detail: next, composed: true }))
    }

    return html`
      <div class="container">
        <i class="asc" ?hidden="${order !=  1}">${dropdownIcon}</i>
        <slot></slot>
        <i class="dsc" ?hidden="${order != -1}">${dropdownIcon}</i>
      </div>
      <button
        aria-label="${label}"
        ?disabled="${disabled}"
        @click="${fireChangeEvent}">
      </button>
    `
  }

  static get styles() {
    return [
      css`
        :host {
          position: relative;
          min-height: 56px;
          display: flex;
          flex-flow: column;
          align-items: center;
          justify-content: center;
          outline: none;
          color: var(--fg1-color);
        }

        :host([place="start"]) { align-items: flex-start }
        :host([place="end"]) { align-items: flex-end }

        :host(:focus) { background: var(--focus-color) }

        :host([disabled]) {
          pointer-events: none;
          touch-action: none;
          color: var(--fg3-color);
        }

        button {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          opacity: 0;
        }

        .container {
          display: flex;
          flex-flow: column;
          align-items: center;
        }
        
        i {
          display: block;
          margin: 0 8px;
          color: var(--fg2-color);
        }

        button[disabled] > i, i[hidden] { opacity: 0 }

        .icon {
          height: 20px;
          width: 20px;
          fill: currentColor;
        }

        .asc { transform: rotate(180deg) }
      `
    ]
  }
}

window.customElements.define("ui-sort", UISort)
