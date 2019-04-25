import { LitElement, css, html } from "lit-element"
import { dropdownIcon, asteriskIcon } from "./~icons"
import { fontStyles } from "./~styles"

class UIInput extends LitElement {
  static get properties() {
    return {
      required: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      active: { type: Boolean, reflect: true },
      type: { type: String, reflect: true },
      min: { type: String, reflect: true },
      max: { type: String, reflect: true },
      select: { type: Boolean, reflect: true },
      label: { type: String },
      value: { type: String },
      options: { type: Array }
    }
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true })
  }

  updated(change) {
    // element is active with non empty values
    if (change.has("value"))
      this.active = Boolean(this.value) && this.value != ""
  }

  render() {
    return html`
      ${this.select ? this.selectTemplate : this.inputTemplate}
      <div class="req" ?hidden="${!this.required}">${asteriskIcon}</div>
    `
  }

  get selectTemplate() {
    const { disabled, label, value, options } = this

    const fireChangeEvent = e => {
      const value = e.currentTarget.value
      this.value = value
      this.dispatchEvent(new CustomEvent("change", {
        detail: value,
        composed: true
      }))
    }

    const optionTemplate = (option, index) => 
      html`<option value="${index}">${option}</option>`

    return html`
      <label class="label fnw fbd2" for="select">${label}</label>
      <span class="value fbd1">${options[value]}</span>
      <i class="dropdown">${dropdownIcon}</i>
      <select id="select"
        class="ffr fnw fbd1"
        aria-label="${label}"
        .value="${value}"
        ?disabled="${disabled}"
        @change="${fireChangeEvent}">
        <option></option>
        ${options.map(optionTemplate)}
      </select>
    `
  }

  get inputTemplate() {
    const { disabled, label, value, type, min, max } = this
    
    const fireChangeEvent = e => {
      const value = e.currentTarget.value
      this.value = value
      this.dispatchEvent(new CustomEvent("change", {
        detail: value,
        composed: true
      }))
    }

    return html`
      <label class="label fnw fbd2" for="input">${label}</label>
      <span class="value fbd1">${value}</span>
      <input id="input"
        class="ffr fnw fbd1"
        aria-label="${label}"
        .type="${type}"
        .value="${value}"
        .min="${min}"
        .max="${max}"
        ?disabled="${disabled}"
        @input="${fireChangeEvent}">
    `
  }

  static get styles() {
    return [
      fontStyles,
      css`
        :host {
          display: block;
          position: relative;
          box-sizing: border-box;
          height: 48px;
          outline: none;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg1-color);
          color: var(--fg1-color);
        }
        :host(:focus) { border-color: var(--primary-color) }
        :host(:focus) > .label,
        :host([active]) > .label {
          transform: translate(0, calc(-50% - 8px)) scale(0.9);
        }
        :host(:focus) > .label,
        :host(:focus) > .req {
          color: var(--primary-color);
        }
        :host([disabled]) {
          color: var(--fg3-color);
          border-color: var(--border3-color);
          pointer-events: none;
          touch-action: none;
        }

        input, select {
          box-sizing: border-box;
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }

        .icon { fill: var(--fg2-color) }

        .label {
          position: absolute;
          display: flex;
          align-items: center;
          height: calc(100% - 16px);
          padding: 0 4px;
          margin: 8px 4px;
          border-radius: 4px;
          will-change: transform;
          transform-origin: top left;
          transition: transform .2s var(--standard-easing);
          pointer-events: none;
          touch-action: none;
          background: inherit;
        }

        .value {
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 8px;
        }

        .dropdown {
          position: absolute;
          top: 0;
          right: 8px;
          display: flex;
          align-items: center;
          height: 100%;
        }

        .req {
          width: 16px;
          height: 16px;
          position: absolute;
          top: -10px;
          left: -9px;
          border-radius: 50%;
          background: var(--bg1-color);
          color: var(--fg3-color);
        }
        .req[hidden] { display: none }

        .req > .icon {
          width: 12px;
          height: 12px;
          padding: 2px;
          fill: currentColor;
        }
      `
    ]
  }
}

window.customElements.define("ui-input", UIInput)
