import { LitElement, css, html } from "lit-element"

class UIButton extends LitElement {
  static get properties() {
    return {
      active: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      icon: { type: Boolean, reflect: true },
      flat: { type: Boolean, reflect: true },
      label: { type: String },
    }
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true })
  }

  render() {
    return html`
      <slot></slot>
      <button
        aria-label="${this.label}"
        ?disabled="${this.disabled}"
        @click="${e => this.active = !this.active && !this.icon}">
      </button>
    `
  }

  static get styles() {
    return [
      css`
        :host {
          box-sizing: border-box;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          min-width: 40px;
          padding: 0 8px;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          outline: none;
          background: none;
          color: var(--fg1-color);
        }

        :host([place="start"]) { justify-content: flex-start }
        :host([place="end"]) { justify-content: flex-end }

        :host([icon]) {
          width: 40px;
          min-height: 40px;
          height: 40px;
          padding: 0px;
          border: none;
          border-radius: 50%;
          color: var(--fg2-color);
          justify-content: center;
        }

        :host([flat]) {
          border: none;
          border-radius: 0;
        }

        :host([disabled]) {
          pointer-events: none;
          touch-action: none;
          border-color: var(--border3-color);
          color: var(--fg3-color);
        }
        :host([icon][disabled]) {
          color: var(--fg3-color);
        }
        :host(:focus) { background: var(--focus-color) }

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

        ::slotted(svg) { fill: currentColor }
      `
    ]
  }
}

window.customElements.define("ui-button", UIButton)