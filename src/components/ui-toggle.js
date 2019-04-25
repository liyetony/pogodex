import { LitElement, css, html } from "lit-element"
import { radioActiveIcon, radioIcon, checkboxActiveIcon, checkboxIcon } from "./~icons"
import { fontStyles, shadowStyles } from "./~styles"

class UIToggle extends LitElement {
  static get properties() {
    return {
      type: { type: String, reflect: true },
      checked: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      label: { type: String },
    }
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true })
  }

  render() {
    const { type, label, checked, disabled } = this
    
    const updateStatus = e => {
      const isChecked = e.currentTarget.checked
      this.checked = type == "radio" ? true : isChecked
      this.dispatchEvent(new CustomEvent("change", {
        detail: isChecked,
        composed: true
      }))
    }

    const inputTemplate = html`
      <input type="checkbox"
        aria-label="${label}"
        .checked="${checked}"
        ?disabled="${disabled}"
        @change="${updateStatus}">`

    switch (type) {
      case "radio": return html`
        ${inputTemplate}
        <i class="status focus"
          ?checked="${checked}">
          ${checked ? radioActiveIcon : radioIcon }</i>
          <slot></slot>
      `
      case "checkbox": return html`
        ${inputTemplate}
        <i class="status focus"
          ?checked="${checked}">
          ${checked ? checkboxActiveIcon : checkboxIcon }</i>
          <slot></slot>
      `
      default: return html`
        ${inputTemplate}
        <slot></slot>
        <div class="switch" ?checked="${checked}">
          <div class="switch-track"></div>
          <div class="switch-focus focus"></div>
          <div class="switch-knob z4"></div>
        </div>
      `
    }
  }

  static get styles() {
    return [
      fontStyles,
      shadowStyles,
      css`
        :host {
          position: relative;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 40px;
          grid-column-gap: 8px;
          align-items: center;
          padding: 0 8px;
          outline: none;
          color: var(--fg1-color);
        }

        :host([type]) {
          grid-template-columns: 40px 1fr;
        }

        :host(:focus) .focus { background: var(--focus-color) }
        :host(:focus) .switch-focus { opacity: 1 }

        :host([disabled]),
        :host([disabled]) .status { color: var(--fg3-color) }
        :host([disabled]) .switch-knob { display: none }
        :host([disabled]) .switch-track { background: var(--border3-color) }

        input {
          box-sizing: border-box;
          position: absolute;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
        }

        .status {
          color: var(--fg2-color);
          border-radius: 50%;
        }
        .status[checked] { color: var(--primary-color) }

        .icon {
          display: block;
          margin: 8px;
          fill: currentColor;
        }

        .switch {
          position: relative;
          display: flex;
          align-items: center;
          width: 40px;
          height: 40px;
          pointer-events: none;
          touch-action: none;
        }

        .switch-track {
          position: absolute;
          top: 12px;
          left: 2px;
          width: 36px;
          height: 16px;
          background: var(--fg3-color);
          border-radius: 8px;
          overflow: hidden;
        }

        .switch-track:before {
          content: "";
          display: block;
          width: 36px;
          height: 16px;
          background: var(--accent-color);
          will-change: transform;
          transition: transform .1s var(--standard-easing);
          transform: translate(-100%, 0);
        }
        .switch[checked] > .switch-track:before { transform: translate(0) }


        .switch-knob {
          z-index: 1;
          position: relative;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg2-color);
          will-change: transform;
          transition: transform .1s var(--standard-easing);
        }
        .switch[checked] > .switch-knob {
          transform: translate(20px, 0);
          background: var(--primary-color)
        }

        .switch-focus {
          position: absolute;
          width: 40px;
          height: 40px;
          top: 0px;
          left: -10px;
          background: var(--focus-color);
          border-radius: 50%;
          opacity: 0;
          will-change: transform;
          transition: transform .1s var(--standard-easing);
        }
        .switch[checked] > .switch-focus { transform: translate(20px, 0) }

      `
    ]
  }
}

window.customElements.define("ui-toggle", UIToggle)